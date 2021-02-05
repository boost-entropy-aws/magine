const path = require('path');
const fs = require('fs');
const util = require('util');
const childProcess = require('child_process');

const writeFile = util.promisify(fs.writeFile);
const resize = require('./resize').default;
const format = require('./format').default;
const imageOptions = require('./options/options');

exports.default = async (event, gmOptions, env) => {
  console.log('event ', event);
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

  let originalWidth;
  let originalHeight;

  const identify = childProcess.spawnSync(appPath, ['identify', tempOriginal], { encoding: 'utf-8' });
  if (!identify.stderr) {
    // Example output:
    // /tmp/screen_shot_2021_02_01_at_09.png PNG 642x664 642x664+0+0 8-bit sRGB 666819B 0.000u 0:00.000
    const identifyStdout = identify.stdout;
    const identifyData = identifyStdout.split(' ');
    const [imageWidth, imageHeight] = identifyData[2].split('x');
    originalWidth = parseInt(imageWidth, 10);
    originalHeight = parseInt(imageHeight, 10);
  }

  // resize each image =>
  const resizeImages = await resize(rules, imageVehicle, storageKey, uuid, imageName, tempOriginal, appPath, originalWidth);
  const { error: newErr, converted } = await format(resizeImages);
  let types;
  let uri;
  if (typeof converted !== 'undefined') {
    types = await converted;
    uri = `${storageKey}/${uuid}/`;
  } else {
    types = [imageName.split('.')[1]];
    uri = `${storageKey}/${s3Trigger}/${processingRule}/${uuid}/`;
  }

  const response = {
    error: newErr,
    types,
    imageName,
    uri
  };

  if (originalWidth && originalHeight) {
    response.dimensions = {
      originalHeight,
      originalWidth,
      aspectRatio: parseFloat((originalWidth / originalHeight).toFixed(2))
    };
  }

  if (typeof converted === 'undefined') {
    response.raw = true;
  }

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
