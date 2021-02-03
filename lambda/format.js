const childProcess = require('child_process');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const imageOptions = require('./options/options');

exports.default = async (params) => {
  let { error } = params;
  const {
    appPath,
    imageVehicle,
    storageKey,
    uuid,
    imageName,
    images
  } = params;
  if (error) {
    return { error, data: '' };
  }
  // images = [resizedImage path, ...]
  const [path, extension] = imageName.split('.');
  const conversions = imageOptions.formats(extension);
  const conversionsPromises = Object.values(conversions).map((conversionFormat) => {
    return Promise.all(images.map(async (originalResized) => {
      let reformatedImage;
      let returnedImage;
      if (conversionFormat.extension !== extension) {
        const resizedReformatted = `${originalResized.split('.')[0]}.${conversionFormat.extension}`;
        const reformatProcess = childProcess.spawnSync(appPath, [originalResized, ['-interlace', 'plane'], resizedReformatted]);
        try {
          reformatedImage = await readFile(resizedReformatted).then(data => data);
        } catch (e) {
          error = e;
        }
        const [blank, temporary, imageMod, reformattedImageName] = resizedReformatted.split('/');
        try {
          returnedImage = await imageVehicle.put(reformatedImage, storageKey, uuid, reformattedImageName, imageMod);
        } catch (e) {
          error = e;
        }
        return returnedImage.Location;
      }
      return originalResized;
    })).then(values => values).catch(err => err);
  });

  const converted = conversionsPromises.reduce(async (extensions, link) => {
    const l = await link;
    if (Array.isArray(l) && l.length > 0) {
      const awaitedExt = Array.isArray(extensions) ? extensions : await extensions;
      return [...awaitedExt, l[0].split('.').pop()];
    }
    return extensions;
  }, []);

  return { error, converted };
};
