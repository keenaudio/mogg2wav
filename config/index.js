//@if LOG
var _f = function(msg) { return "config/index.js: " + msg; };
//@end

var fs = require('fs');

module.exports = function(config) {

  var jsPath = './d';
  var excludeJS = [ // JS files to exclude, if any
    'index.js'
  ];

  fs.readdirSync(jsPath).forEach(function(file) {
    if (file.match(/.+\.js/g) !== null && excludeJS.indexOf(file) === -1) {
      var name = file.replace('.js', ''); // allow subdirectories with an index.js
      var filePath = jsPath + '/' + name;
      console.log(_f("Loading JS config: " + filePath)
      require(filePath)(config);
    }
  });


  var jsonPath = './';
  var excludeJS = [ // JSON files to exclude, if any

  ];

  fs.readdirSync(jsonPath).forEach(function(file) {
    if (file.match(/.+\.js/g) !== null && exclude.indexOf(file) === -1) {
      var filePath = jsonPath + '/' + file;
      console.log(_f("Loading JSON config: " + filePath)
      var jsonData = require(filePath);
      config.merge(jsonData);
    }
  });

  return config;
}