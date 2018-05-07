const AWS = require('aws-sdk');
const im = require('imagemagick');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const cmsimage = require('../data/cmsimage_rules.json');
const products = require('../data/products_rules.json');
const stories = require('../data/stories_rules.json');
const taxons = require('../data/taxons_rules.json');
const BUCKET = process.env.BUCKET;

// TO DO: Refactor route into index that calls functional composition: route(getImage(imageWork(setImage()))), to be more testable

// take the image input URL from s3, along with certain rules from` the path of the s3 location to determine the correct type of resizing and optimization
// all product and story images come from the /media/ path.
exports.route = (event, context, callback) => {
  console.log(JSON.stringify(event));
  return getImage(`${event.Records.s3.object.key}`, callback);
};

const getImage = (imagePath, callback) => {
    // get image from s3 via pipe in a promise
  const params = {
    Bucket: BUCKET,
    Key: imagePath
  };

  const imageObj = S3.getObject(params).promise();
  console.log(imageObj);
};

const imageWork = (args, callback) => {
  // args will be an object with the data type of image, the Buffer with the image data, the original image path

};

const setImage = (args, callback) => {
  // args will be an object with the returned imagemagick buffer, new image path ( fully qualified with directory )
};
