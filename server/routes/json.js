var express = require('express');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

module.exports = function(config, api) {

	var app = express.Router();

  app.use(function(req, res, next) {
    console.log("JSON request");
    next();
  });

  app.get('/als/projects', function(req, res, next) {
    api.alsProjects(function(err, files) {
      res.json(files);
    });
  });

  app.get('/als/project/:project', function(req, res, next) {
    api.alsProject(req.params.project, function(err, data) {
      res.json(data);
    });
  });

  app.get('/als/daw/:project', function(req, res, next) {
    api.alsDaw(req.params.project, function(err, data) {
      res.json(data);
    });
  });


	app.get('/folders', function(req, res, next) {
    api.folders(function(err, files) {
			res.json(files);
		});
	});

	app.get('/folders/:folder', function(req, res, next) {
		api.files(req.params.folder, function(err, files) {
			res.json(files);
		});
	});

  app.get('/samples/:folder', function(req, res, next) {
    var folder = req.params.folder;
    api.meta(folder, function(err, meta) {
    	console.log("META: " + JSON.stringify(meta, null, 2));
	    api.files(folder, function(err, files) {

	      var samples = [], effects = [];
	      for (var i = 0; i < files.length; i++) {
	        samples.push({
	          id: (i+1)+"",
	          url: '/folders/' + encodeURIComponent(folder) + '/' + encodeURIComponent(files[i]),
	          track: (i+1),
	          startTime: [0],
	          duration: meta.duration
	        });
	        effects.push([]);
	      }

	      var data = {
	        projectInfo: {
	          tempo: 120,
	          tracks: files.length,
	          effects: effects
	        },
	        samples: samples
	      }
	      res.json(data);
	    });
	  });
  });


	return app;
}