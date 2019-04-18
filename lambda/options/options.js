exports.paths = (key) => {
  console.log(key);
  const validPaths = /(box)|(category-item)|(circle)|(hero)|(icon-about)|(icon)|(mini)|(product-list)|(product)|(story-wide)/g;
  const regexPath = validPaths.exec(key);
  const [pathKey] = regexPath !== null ? regexPath : ['default'];
  const rules = require(`./${pathKey}_rules.json`);
  return rules;
};

exports.formats = (imageExt) => {
  const formatRules = require(`./${imageExt}_conversion.json`);
  return formatRules;
};
