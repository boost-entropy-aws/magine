const AWS = require('aws-sdk');
const im = require('imagemagick');
const S3 = new AWS.S3({
	signatureVersion: 'v4',
});
const cmsimage = require('../data/cmsimage_rules.json');
const products = require('../data/products_rules.json');
const stories = require('../data/stories_rules.json');
const taxons = require('../data/taxons_rules.json');
const BUCKET = process.env.BUCKET;

// take the image input URL from s3, along with certain rules from the path of the s3 location to determine the correct type of resizing and optimization
// all product and story images come from the /media/ path.
exports.route = (event, context, callback) => {
    console.log(JSON.stringify(event));
    callback(null, 'OK');
}

const getImage = (imagePath, callback) => {

}

const imageWork = (args, callback) => {

}

const setImage = (imagePath, callback) => {

}
