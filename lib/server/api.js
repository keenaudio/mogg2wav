var fs = require('fs');
var glob = require('glob');
var path = require('path');

module.exports = function(config) {
	return {
    meta: function(folder, cb) {
      var filePath = path.join(config.get('paths.meta'), folder) + '.json';
      console.log("Loading meta from: " + filePath);
      fs.readFile(filePath, function(err, contents) {
        if (err) console.error(err);
        var meta = JSON.parse(contents);
        cb(err, meta);
      });
    },
		folders: function(cb) {
			fs.readdir(config.get('paths.folders'), function(err, files) {
				cb(err, files);
			});
		},
    files: function(folder, cb) {
      var folder = path.join(config.get('paths.folders'), folder);
      glob("*.wav", { cwd: folder }, function(err, files) {
        cb(err, files);
      });
    },
    alsProjects: function(cb) {
      fs.readdir(config.get('paths.als'), function(err, files) {
        cb(err, files);
      });
    },
    alsProject: function(folder, cb) {
      var filePath = path.join(config.get('paths.als'), folder, folder) + '.json';
      fs.readFile(filePath, function(err, contents) {
        if (err) console.error(err);
        var projectJSON = JSON.parse(contents);
        cb(err, projectJSON);
      })
    }
	}
}