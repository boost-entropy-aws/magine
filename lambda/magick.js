const path = require('path');
const fs = require('fs');
const util = require('util');
const sizeOf = require('image-size');

const writeFile = util.promisify(fs.writeFile);
const resize = require('./resize').default;
const format = require('./format').default;
const imageOptions = require('./options/options');

exports.default = async (event, gmOptions, env) => {
  // const gm = require('gm').subClass(gmOptions);
  const imageVehicle = require(path.resolve(__dirname, 'vehicles', env));
  // this needs a catch block
  const {
    error,
    fullLocation,
    storageKey,
    s3Trigger,
    processingRule,
    uuid,
    imageName,
    file,
    message
  } = await imageVehicle.get(event);
  // this creates the /tmp directory
  const newDir = await imageVehicle.dir('tmp');
  // write a temporary file
  let tempOriginal;
  try {
    tempOriginal = await writeFile(path.resolve(newDir, imageName), file).then((data) => {
      console.log('tempOriginal data ', data);
      return path.resolve(newDir, imageName);
    });
  } catch (e) {
    console.log('tempOriginal e', e);
  }
  
  console.log('tempOriginal ', tempOriginal);
  fs.access(tempOriginal, fs.constants.F_OK, (err) => {
    console.log(`${tempOriginal} ${err ? 'does not exist' : 'exists'}`);
  });
  fs.stat(tempOriginal, (err, stats) => {
    if (err) {
      console.log('tempOriginal stat err ', err);
    } else {
      console.log('tempOriginal stat ', stats);
    }
  });
  // get data options for images based on path
  const rules = imageOptions.paths(processingRule);
  const { appPath = 'magick' } = gmOptions;
  // resize each image =>
  console.log('rules ', rules);
  const resizeImages = await resize(rules, imageVehicle, storageKey, uuid, imageName, tempOriginal, appPath);
  const { error: newErr, converted } = await format(resizeImages);
  const types = await converted;
  const dimensions = sizeOf(tempOriginal);
  const response = {
    error: newErr,
    types,
    imageName,
    uri: `${storageKey}/${uuid}/`,
    dimensions: {
      originalHeight: dimensions.height,
      originalWidth: dimensions.width,
      aspectRatio: parseFloat((dimensions.width / dimensions.height).toFixed(2))
    }
  };
  // response should look like this:
  /*
    {
      error: <null>||<String>,
      types: <Array>, [jpg, webp]
      name: <String>,
      uri: <String>
    }
  */
  return { response, message };
};
