const path = require('path');
const fs = require('fs');
const util = require('util');
const childProcess = require('child_process');

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
  const tempOriginal = await writeFile(path.resolve(newDir, imageName), file).then(data => path.resolve(newDir, imageName));
  fs.stat(tempOriginal, (err, stats) => !err ? console.log(stats) : console.log(err));
  // get data options for images based on path
  const rules = imageOptions.paths(processingRule);
  const { appPath = 'magick' } = gmOptions;
  // resize each image =>
  console.log('rules ', rules);
  const resizeImages = await resize(rules, imageVehicle, storageKey, uuid, imageName, tempOriginal, appPath);
  const { error: newErr, converted } = await format(resizeImages);
  const types = await converted;

  // Example output:
  // /tmp/screen_shot_2021_02_01_at_09.png PNG 642x664 642x664+0+0 8-bit sRGB 666819B 0.000u 0:00.000
  const identifyStdout = childProcess.spawnSync(appPath, ['identify', tempOriginal], { encoding: 'utf-8' }).stdout;
  const identifyData = identifyStdout.split(' ');
  const [imageWidth, imageHeight] = identifyData[2].split('x');

  const response = {
    error: newErr,
    types,
    imageName,
    uri: `${storageKey}/${uuid}/`,
    dimensions: {
      originalHeight: parseInt(imageHeight, 10),
      originalWidth: parseInt(imageWidth, 10),
      aspectRatio: parseFloat((imageWidth / imageHeight).toFixed(2))
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
