const stream = require('stream')
const AWS = require('aws-sdk');
const gm = require('gm').subClass({imageMagick: true});
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const BUCKET = process.env.BUCKET;

// TO DO: Refactor route into index that calls functional composition: route(getImage(imageWork(setImage()))), to be more testable

// take the image input URL from s3, along with certain rules from` the path of the s3 location to determine the correct type of resizing and optimization
// all product and story images come from the /media/ path.
exports.route = (event, context, callback) => {
  console.log(JSON.stringify(event));
  if (!event.hasOwnProperty('Records') && !event.hasOwnProperty('pathParameters')) {
    return callback('not a valid request');
  }
  if (event.hasOwnProperty('Records') && event.Records[0].s3.object.key.split('/').includes('original')) {
    return getImage(`${event.Records[0].s3.object.key}`, callback);
  } else if (event.hasOwnProperty('Records')) {
    return callback(null, 'not original image');
  } else if (event.hasOwnProperty('pathParameters')) {
    // WIP for API Gateway
  }
  return callback('unhandled event condition');
};

const getImage = async (imagePath, callback) => {
    // get image from s3 via pipe in a promise
  const params = {
    Bucket: BUCKET,
    Key: imagePath // 'media/<type>/<folder>/<imageKey>/<imageType>/<imageName>.<imageExt>'
  };

  const response = await s3.getObject(params, (err) => {
    if (err) {
      callback(err);
    }
  }).promise();

  const imageRulesArguments = {
    contentType: response.ContentType,
    data: response.Body,
    imagePath,
  };

  return setImageRules(imageRulesArguments, callback);
};

const setImageRules = (args, callback) => {
  const ruleType = args.imagePath.split('/')[1] === ('cmsimage'||'products'||'stories'||'taxons') ? args.imagePath.split('/')[1] : null;
  if ( ruleType === null ) {
    return callback('unable to find rule matching image category');
  }
  const rules = require(`../data/${ruleType}_rules.json`);
  console.log(rules);
  return imageWork(rules, {contentType: args.contentType, imageData: args.data, imagePath: args.imagePath}, callback)
}

const imageWork = (rules, args, callback) => {
  // args will be an object with the data type of image, the Buffer with the image data, the original image path
  Object.entries(rules).forEach(([imageKey, imageVal]) => {
    gm(args.imageData)
    .command('convert')
    .in('-filter', 'Triangle', '-define', 'filter:support=2', '-thumbnail', `${imageVal.width}`, '-unsharp', '0.25x0.25+8+0.065', '-dither', 'None', '-posterize', '136', '-quality', '82', '-define', 'jpeg:fancy-upsampling=off', '-define', 'png:compression-filter=5', '-define', 'png:compression-level=9', '-define', 'png:compression-strategy=1', '-define', 'png:exclude-chunk=all', '-interlace', 'none', '-colorspace', 'sRGB', '-strip')
    .toBuffer( (err, buffer) => {
      if ( err ) {
        console.log(`error: ${err}`);
        callback(err)
      }
      setImage({imBuffer: buffer, newImagePath: /original/.test(args.imagePath) ? args.imagePath.replace(/original/, imageKey) : args.imagePath}, callback)
    })
  })
};

const identifyFormat = (imageData) => {
  // Identify format via identify command
  return gm(imageData).command('identify');
};

const convertFormat = () => {
  // Should this be something that is an argument passed into imageWork? This is a placeholder commit for research.
};

const setImage = async (args, callback) => {
  // args will be an object with the returned imagemagick buffer, new image path ( fully qualified with directory )
  const params = {
    Body: args.imBuffer,
    Bucket: BUCKET,
    Key: args.newImagePath
  };

  const request = await s3.putObject(params, (err) => {
    if (err) {
      callback(err);
    }
  }).promise()

  return callback(null, request);
};
