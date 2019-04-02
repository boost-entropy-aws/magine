exports.paths = (location) => {
  console.log(location);
  const validPaths = /(cmsimage)|(products)|(stories)|(taxons)/g;
  const regexPath = validPaths.exec(location);
  const [pathKey] = regexPath !== null ? regexPath : ['default'];
  const rules = require(`./${pathKey}_rules.json`);
  return rules;
};

exports.formats = (imageExt) => {
  const formatRules = require(`./${imageExt}_conversion.json`);
  return formatRules;
};
