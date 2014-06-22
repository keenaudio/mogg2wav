var fs = require('fs');
var glob = require('glob');
var path = require('path');
var _ = require('underscore');

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
    alsProject: function(folder, cb) { // return raw json for als project
      var filePath = _.template(config.getRaw('als2json.output'), {
        folder: folder,
        config: config
      }); 
      fs.readFile(filePath, function(err, contents) {
        if (err) console.error(err);
        var json = JSON.parse(contents);
        cb(err, json);
      });
    },
    alsDaw: function(folder, cb) {
      var filePath = _.template(config.getRaw('als2daw.output'), {
        folder: folder,
        config: config
      }); 
      fs.readFile(filePath, function(err, contents) {
        if (err) console.error(err);
        var json = JSON.parse(contents);
        cb(err, json);
      });
    }
	}
}