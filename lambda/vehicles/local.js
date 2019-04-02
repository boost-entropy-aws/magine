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
  const newImage = await writeFile(path.resolve(__dirname, '..', '..', imageKey, location), image).then(data => data).catch(err => console.log(err));
  return newImage;
};

exports.dir = async (descriptor) => {
  console.log('imageVehicle.dir: ', descriptor);
  const newDir = await mkdir(descriptor, { recursive: true }).then(data => descriptor).catch(err => console.log(err));
};
