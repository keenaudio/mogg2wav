var express = require('express');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var api = require('../api');

module.exports = function(config) {

	var app = express.Router();

	app.get('/folders', function(req, res, next) {
    api.folders(function(err, files) {
			res.json(files);
		});
	});

	app.get('/wavs/:folder', function(req, res, next) {
		api.wavs(req.params.folder, function(err, files) {
			res.json(files);
		});
	});

	return app;
}