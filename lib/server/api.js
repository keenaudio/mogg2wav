var fs = require('fs');
var glob = require('glob');
var path = require('path');

module.exports = function(config) {
	return {
		folders: function(cb) {
			fs.readdir(config.get('library.folders'), function(err, files) {
				cb(err, files);
			});
		},
    files: function(folder, cb) {
      var folder = path.join(config.get('library.folders'), folder);
      glob("*.wav", { cwd: folder }, function(err, files) {
        cb(err, files);
      });
    }
	}
}