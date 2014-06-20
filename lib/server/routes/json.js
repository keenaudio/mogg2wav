var express = require('express');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

module.exports = function(config) {

	var app = express.Router();

	app.get('/folders', function(req, res, next) {
		fs.readdir(config.get('library.folders'), function(err, files) {
			res.json(files);
		});
	});

	app.get('/wavs/:folder', function(req, res, next) {
		var folder = path.join(config.get('library.folders'), req.params.folder);
		glob("*.wav", { cwd: folder }, function(err, files) {
			res.json(files);
		});
	});

	return app;
}