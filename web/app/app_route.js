var express = require('express');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var _ = require('underscore');

//@if DEV
var DEV = (process.env.NODE_ENV === "development");
//@end

module.exports = function(config) {

  var app = express.Router();
  var clientConfig = {
    routes: config.get('routes')
  };


  //@if DEV
  if (DEV) {
    app.use(express.static('.tmp/web/app', { hidden: true }));
  }
  //@end


  app.use(express.static('web/app'));

  app.use(function(req, res, next) {
    if (req.path === '/') {
      res.render('app/app.jade', {
        clientConfig: clientConfig
      });
    } else {
      console.log("App: no handler for path: " + req.path);
      next();
    }
  });


  return app;
}