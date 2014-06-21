var path = require('path');

module.exports = function(config) {

  var rootDir = path.resolve(__dirname, '../..'); // config/d
  var configDir = path.resolve(rootDir, '..'); // config
  var tmpDir = path.join(rootDir, '.tmp');

  //   // Disk paths
  function mkpath() {
    var base = rootDir;
    var extra = arguments[0];
    if (arguments.length === 2) {
      base = arguments[0];
      extra = arguments[1];
    }
    return path.join(base, extra);
  }

  config.merge({
    paths: {
      root: rootDir,
      revManifest: mkpath('rev-manifest.json'),
      buildInfo: mkpath('build_info.json'),
      configJSON: mkpath('config.json'),
      "configJSON.default": mkpath('config.json.default')
    }
  });

}