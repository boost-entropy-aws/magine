const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
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
  const image = s3.getObject(params, err => {
    if (err) {
      return err;
    }
  }).promise();
  return { location, filename, file: image };
};

exports.put = async (image, imageKey, location) => {
  console.log(image, imageKey, location);
  const params = {
    Body: image,
    Bucket: BUCKET,
    Key: location
  };
  const newImage = s3.upload(params, err => {
    if (err) {
      return err;
    }
  }).promise();
  return newImage;
};

exports.dir = async (descriptor) => {
  console.log('imageVehicle.dir: ', descriptor);
  const newDir = await mkdir(descriptor, { recursive: true }).then(data => descriptor).catch(err => console.log(err));
};
