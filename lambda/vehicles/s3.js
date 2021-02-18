const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const { MAGINE_BUCKET, ASSETS_BUCKET } = process.env;
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
    Bucket: MAGINE_BUCKET,
    Key: fullLocation
  };
  const image = s3Params => new Promise((resolve, reject) => {
    console.log('Get object:', s3Params);
    s3.getObject(s3Params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });

  const imageDecorator = s3Params => new Promise((resolve, reject) => {
    const enhancedParams = Object.assign({}, s3Params, { Key: `${s3Params.Key.split('.')[0]}.json` });
    console.log('Get object:', enhancedParams);
    s3.getObject(enhancedParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log('imageDecorator data', data);
        resolve(data.Body.toString('utf8'));
      }
    });
  });

  const file = await image(params);
  const message = await imageDecorator(params);
  console.log('message retrieved from s3 json', message);
  return {
    error,
    fullLocation,
    storageKey,
    s3Trigger,
    processingRule,
    uuid,
    imageName,
    file,
    message
  };
};

exports.put = async (image, ...imagePaths) => {
  console.log('imagePaths: ', imagePaths);
  const [storageKey, uuid, imageName, imageMod] = imagePaths;
  const [name, type] = imageName.split('.');
  const newS3Key = `${storageKey}/${uuid}/${name}-${imageMod}.${type}`;
  const params = {
    Body: image,
    Bucket: ASSETS_BUCKET,
    Key: newS3Key,
    ContentType: `image/${type}`,
    CacheControl: 'max-age=31536000'
  };
  const newImage = s3Params => new Promise((resolve, reject) => {
    console.log('Put object:', s3Params)
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
    const newDir = await mkdir(tmpPath, { recursive: true }).then(data => tmpPath).catch(err => {
      console.log('newDir err::', err);
      return err
    });
    const returnedDir = Object.prototype.hasOwnProperty.call(newDir, 'code') ? tmpPath : newDir;
    console.log('returneDir::', returnedDir);
    return returnedDir;
  }
  return tmpPath;
};
