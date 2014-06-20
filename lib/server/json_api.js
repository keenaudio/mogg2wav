var express = require('express');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var api = require('../api');

module.exports = function(config) {

	var app = express.Router();
  app.use(function(req.res, next) {
    console.log("JSON request");
    next();
  });

	app.get('/folders', function(req, res, next) {
    api.folders(function(err, files) {
			res.json(files);
		});
	});

	app.get('/folders/:folder', function(req, res, next) {
		api.wavs(req.params.folder, function(err, files) {
			res.json(files);
		});
	});

  app.get('/samples/:folder', function(req, res, next) {
    var folder = req.params.folder;
    api.wavs(folder, function(err, files) {

      var samples = [];
      for (var i = 0; i < files.length; i++) {
        samples.push({
          id: (i+1),
          url: encodeURIComponent('/folders/' + folder + '/' + file),
          track: (i+1),
          startTime: [0],
          duration: 1000
        });
      }

      var data = {
        projectInfo: {
          tempo: 120,
          tracks: files.length
        },
        samples: samples
      }
      res.json(data);
    });
  });



	return app;
}