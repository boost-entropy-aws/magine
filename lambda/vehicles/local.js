const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

exports.get = async (event) => {
  const location = event.key;
  const filename = location;
  const image = await readFile(path.resolve(__dirname, '..', '..', location)).then(data => data).catch(err => console.log(err));
  return { location, filename, file: image };
};

exports.put = async (image, imageKey, location) => {
  console.log(image, imageKey, location);
  // imagemagick already created the images in /tmp. No need to proceed.
  return image;
};

exports.dir = async (...descriptor) => {
  console.log('imageVehicle.dir: ', descriptor);
  const tmpPath = path.resolve(__dirname, '..', ...descriptor);
  const newDir = await mkdir(tmpPath, { recursive: true }).then(data => tmpPath).catch(err => console.log(err));
  const returnedDir = Object.prototype.hasOwnProperty.call(newDir, 'code') ? tmpPath : newDir;
  return returnedDir;
};
