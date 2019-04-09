const AWS = require('aws-sdk');
s
const BUCKET = process.env.BUCKET;
const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

exports.get = async (event) => {
  const location = event.Records[0].s3.object.key;
  const filename = location.split('/').pop();
  const params = {
    Bucket: BUCKET,
    Key: location
  }
  const image = await s3.getObject(params, err => {
    if (err) {
      return err;
    }
  });
  return { location, filename, file: image.Body };
};

exports.put = async (image, imageKey, location) => {
  console.log(image, imageKey, location);
  const params = {
    Body: image,
    Bucket: BUCKET,
    Key: location
  };
  const newImage = await s3.upload(params, err => {
    if (err) {
      return err;
    }
  });
  return newImage;
};

exports.dir = async (...descriptor) => {
  console.log('imageVehicle.dir: ', ...descriptor);
  const tmpPath = path.resolve('/', ...descriptor);
  if ( tmpPath !== '/tmp' ) {
    const newDir = await mkdir(tmpPath, { recursive: true }).then(data => tmpPath).catch(err => console.log(err));
    return newDir;
  }
  return tmpPath;
};
