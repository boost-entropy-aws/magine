const path = require('path');
const child_process = require('child_process');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const imageOptions = require('./options/options');

exports.default = async (event, gmOptions, env) => {
  console.log('magick', gmOptions);
  // const gm = require('gm').subClass(gmOptions);
  const imageVehicle = require(path.resolve(__dirname, 'vehicles', env));
  const { location, filename, file } = await imageVehicle.get(event);
  // this creates the /tmp directory
  console.log(location, filename, file);
  const newDir = await imageVehicle.dir('tmp');
  // write a temporary file
  const tempOriginal = await writeFile(path.resolve(newDir, filename), file).then(data => path.resolve(newDir, filename));
  fs.stat(tempOriginal, (err, stats) => !err ? console.log(stats) : console.log(err));
  // get data options for images based on path
  const rules = imageOptions.paths(location);
  const { appPath = 'magick' } = gmOptions;
  // resize each image =>
  const resizedImages = Object.entries(rules).map( async ([imageKey, imageVal]) => {
    const magickArgs = ['-filter', 'Triangle', '-define', 'filter:support=2', '-thumbnail', `${imageVal.width}`, '-unsharp', '0.25x0.25+8+0.065', '-dither', 'None', '-posterize', '136', '-quality', '82', '-define', 'jpeg:fancy-upsampling=off', '-define', 'png:compression-filter=5', '-define', 'png:compression-level=9', '-define', 'png:compression-strategy=1', '-define', 'png:exclude-chunk=all', '-interlace', 'none', '-colorspace', 'sRGB', '-strip'];
    const tmpResizedDescriptor = await imageVehicle.dir('tmp', imageKey);
    // this sets the location and descriptor of the resized file
    const resizedPath = path.resolve(tmpResizedDescriptor, filename);
    console.log('resizedPath ', resizedPath);
    // TODO: check that this works, as I am passing in the temp paths.
    const argsArray = [tempOriginal, ...magickArgs, resizedPath];
    const magickProcess = child_process.spawnSync(appPath, argsArray);
    const resizedImage = await readFile(resizedPath).then(data => data);
    console.log('resizedImage ', resizedImage);
    // this below will perform I/O in non local formats.
    const returnedImage = await imageVehicle.put(resizedImage, tmpResizedDescriptor, location);
    console.log(returnedImage);
    return resizedImage;
  });
  // Perform imagemagick on the resized images to convert to different format (JPG -> WEBP)
  resizedImages.map((image) => {
    console.log(image);
    // need the file extension
    // if png, then test the alpha channel usage and if no usage, then use the jpg format
    // pass the new file extension to imageOptions.formats()
  });
};
