const ajv = require('ajv');
const path = require('path');
const magick = require('./magick');

exports.route = async (event, context, callback) => {
  // TO DO: Implement the route switching via ajv validation.
  let gmOpts = {};
  let environment = 'default';
  if (event.body) {
    gmOpts = Object.assign({}, gmOpts, { appPath: `${path.resolve(__dirname, 'bin', 'exodus', 'bin', 'magick')}`, imageMagick: true });
    environment = 'api';
  } else if (event.Records) {
    gmOpts = Object.assign({}, gmOpts, { appPath: `${path.resolve(__dirname, 'bin', 'exodus', 'bin', 'magick')}`, imageMagick: true });
    environment = 's3';
  } else if (event.key) {
    gmOpts = Object.assign({}, gmOpts, { imageMagick: true });
    environment = 'local';
  }
  const { error, ...imageWork } = await magick.default(event, gmOpts, environment);
  callback(error, imageWork);
  // TO DO: use the return value of imageWork to decide how to use callback(...params).
};
