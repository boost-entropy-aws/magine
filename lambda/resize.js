const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

exports.default = async (rules, imageVehicle, storageKey, uuid, imageName, tempOriginal, appPath) => {
  let err = null;
  let tmpResizedDescriptor;
  let resizedImage;
  let returnedImage;
  const resizedImages = Object.entries(rules).map(async ([imageMod, imageDim]) => {
    const magickArgs = [
      '-filter',
      'Triangle',
      '-define',
      'filter:support=2',
      '-thumbnail',
      `${imageDim.width}`,
      '-unsharp',
      '0.25x0.25+8+0.065',
      '-dither',
      'None',
      '-posterize',
      '136',
      '-quality',
      '82',
      '-define',
      'jpeg:fancy-upsampling=off',
      '-define',
      'png:compression-filter=5',
      '-define',
      'png:compression-level=9',
      '-define',
      'png:compression-strategy=1',
      '-define',
      'png:exclude-chunk=all',
      '-interlace',
      'none',
      '-colorspace',
      'sRGB',
      '-strip'
    ];
    const magickGifArgs = [
      '+dither',
      '-layers',
      'Optimize',
      '-colors',
      '32'
    ];
    try {
      tmpResizedDescriptor = await imageVehicle.dir('tmp', imageMod);
    } catch (e) {
      console.log('resized images e ', e);
      err = e;
    }
    // this sets the location and descriptor of the resized file
    const resizedPath = path.resolve(tmpResizedDescriptor, imageName);
    // TODO: check that this works, as I am passing in the temp paths.
    let argsArray;
    if (imageName.split('.')[1] === 'gif') {
      argsArray = [tempOriginal, ...magickGifArgs, resizedPath];
    } else {
      argsArray = [tempOriginal, ...magickArgs, resizedPath];
    }
    console.log('argsArray ', argsArray);

    try {
      const magickProcess = childProcess.spawnSync(appPath, argsArray); // eslint-disable-line no-unused-vars
      if (magickProcess.stdout) console.log('magickProcess.stdout:', magickProcess.stdout);
      if (magickProcess.stderr) console.log('magickProcess.stderr:', magickProcess.stderr);
    } catch (e) {
      console.log('resize::magickProcess line 74', e);
      err = e;
    }

    try {
      resizedImage = await readFile(resizedPath).then(data => data);
      console.log('resize::resizedImage at resizedImage line 80', resizedImage);
    } catch (e) {
      console.log('resize::resizedImage catch line 82', e);
      err = e;
    }
    // this below will perform I/O in non local formats.
    try {
      console.log('resize::resizedImage line 87:', resizedImage);
      returnedImage = await imageVehicle.put(resizedImage, storageKey, uuid, imageName, imageMod);
    } catch (e) {
      console.log('resize::returnedImage catch: line 90', e);
      err = e;
    }
    return resizedPath;
  });
  const images = await Promise.all(resizedImages).then(all => all);
  return {
    error: err,
    appPath,
    imageVehicle,
    storageKey,
    uuid,
    imageName,
    images
  };
};
