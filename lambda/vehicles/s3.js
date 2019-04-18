const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const { BUCKET } = process.env;
const util = require('util');
const fs = require('fs');
const path = require('path');

const mkdir = util.promisify(fs.mkdir);

exports.get = async (event) => {
  let error = null;
  const fullLocation = event.Records[0].s3.object.key;
  if (fullLocation.split('/').length !== 5) {
    error = 'S3 path is incorrect, should match: storageKey/S3Trigger/processingRule/UUID/imagename';
  }
  const [storageKey, s3Trigger, processingRule, uuid, imageName] = fullLocation.split('/');
  const params = {
    Bucket: BUCKET,
    Key: fullLocation
  };
  const image = s3Params => new Promise((resolve, reject) => {
    s3.getObject(s3Params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });

  const file = await image(params);
  return {
    error,
    fullLocation,
    storageKey,
    s3Trigger,
    processingRule,
    uuid,
    imageName,
    file
  };
};

exports.put = async (image, ...imagePaths) => {
  console.log('imagePaths: ', imagePaths);
  const [storageKey, uuid, imageName, imageMod] = imagePaths;
  const newS3Key = `${storageKey}/${uuid}/${imageName.split('.')[0]}-${imageMod}.${imageName.split('.')[1]}`;
  const params = {
    Body: image,
    Bucket: BUCKET,
    Key: newS3Key
  };
  const newImage = s3Params => new Promise((resolve, reject) => {
    s3.upload(s3Params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  const uploaded = await newImage(params);
  return uploaded;
};

exports.dir = async (...descriptor) => {
  console.log('imageVehicle.dir: ', ...descriptor);
  const tmpPath = path.resolve('/', ...descriptor);
  if (tmpPath !== '/tmp') {
    const newDir = await mkdir(tmpPath, { recursive: true }).then(data => tmpPath).catch(err => console.log(err));
    return newDir;
  }
  return tmpPath;
};
