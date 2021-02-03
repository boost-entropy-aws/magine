const ajv = require('ajv');
const path = require('path');
const magick = require('./magick');
const publish = require('./publishMessage');

exports.route = async (event, context, callback) => {
  // TO DO: Implement the route switching via ajv validation.
  let gmOpts = {};
  let environment = 'default';
  if (event.body) {
    gmOpts = Object.assign({}, gmOpts, { appPath: `${path.resolve(__dirname, 'bin', 'exodus', 'bin', 'magick')}`, imageMagick: true });
    environment = 'api';
  } else if (event.Records) {
    const fullLocation = event.Records[0].s3.object.key;
    const fileName = fullLocation.split('/').pop();
    const extension = path.extname(fileName);
    if (extension === '.json') {
      return callback(null, "Don't work on JSON files");
    }
    gmOpts = Object.assign({}, gmOpts, { appPath: `${path.resolve(__dirname, 'bin', 'exodus', 'bin', 'magick')}`, imageMagick: true });
    environment = 's3';
  } else if (event.key) {
    gmOpts = Object.assign({}, gmOpts, { imageMagick: true });
    environment = 'local';
  }
  const { response, message } = await magick.default(event, gmOpts, environment);
  const { error, ...imageWork } = response;
  await publish.pub(message, imageWork);
  return callback(error, imageWork);
  // TO DO: use the return value of imageWork to decide how to use callback(...params).
};
