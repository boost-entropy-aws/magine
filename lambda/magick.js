const path = require('path');
const fs = require('fs');
const util = require('util');

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
    file
  } = await imageVehicle.get(event);
  // this creates the /tmp directory
  const newDir = await imageVehicle.dir('tmp');
  // write a temporary file
  const tempOriginal = await writeFile(path.resolve(newDir, imageName), file).then(data => path.resolve(newDir, imageName));
  fs.stat(tempOriginal, (err, stats) => !err ? console.log(stats) : console.log(err));
  // get data options for images based on path
  const rules = imageOptions.paths(processingRule);
  const { appPath = 'magick' } = gmOptions;
  // resize each image =>
  const resizeImages = await resize(rules, imageVehicle, storageKey, uuid, imageName, tempOriginal, appPath);
  const { error: newErr, converted } = await format(resizeImages);
  const types = await converted;
  const response = {
    error: newErr,
    types,
    imageName,
    uri: `${storageKey}/${uuid}/`
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
  return response;
};
