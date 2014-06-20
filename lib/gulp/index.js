module.exports = function($) {
  console.log("loading gulp helpers");
  // Load `*.js` under current directory (except those in the exclude list)
  // Each exports object returned will be merged into our exports
  var path = __dirname;

  var exclude = [ // files to exclude, if any
    'index.js'
  ];

  function camelize(str) {
    return str.replace(/[-_](\w)/g, function(m, p1) {
      return p1.toUpperCase();
    })
  };

  var exports = {};
  require('fs').readdirSync(path).forEach(function(file) {
    if (file.match(/.+\.js/g) !== null && exclude.indexOf(file) === -1) {
      var name = file.replace('.js', '');
      var moduleExports = require('./' + file)($);
      var n = camelize(name);
      console.log("Loading gulp helper: " + n);
      //for (var n in moduleExports) {
        if (exports[n]) console.error("ERROR processing file '" + file + "'.  Object '" + n + "' has already been added to exports list"); //@strip
        exports[n] = moduleExports;
       // console.log("Object '" + n + "' included from file: " + file); //@strip
      //}
    }
  });

  return exports;
}
