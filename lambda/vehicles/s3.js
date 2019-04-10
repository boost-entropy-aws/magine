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
  const image = (params) => {
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Body);
        }
      })
    })
  }

  const file = await image(params);
  return { location, filename, file };
};

exports.put = async (image, imageKey, location) => {
  console.log('put image', image);
  console.log('imageKey', imageKey);
  console.log('location', location);
  const newLocation = location.replace(/original/, imageKey.split('/')[2]);
  // need to merge the imageKey and location to get the right key for S3
  // imageKey /tmp/icon_about
  // location media/cmsimage/original/abstract...jpg
  const params = {
    Body: image,
    Bucket: BUCKET,
    Key: newLocation
  };
  const newImage = (params) => {
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })
  };

  const uploaded = await newImage(params);
  return uploaded;
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
