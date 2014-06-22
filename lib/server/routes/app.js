var express = require('express');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

//@if DEV
var DEV = (process.env.NODE_ENV === "development");
//@end

module.exports = function(config) {

  var app = express.Router();



  //@if DEV
  if (DEV) {
    app.use(express.static('.tmp/web/app', { hidden: true }));
  }
  //@end


  app.use(express.static('web/app'));

  app.use(function(req, res, next) {
    if (req.path === '/') {
      res.render('pages/app.jade', {});
    } else {
      console.log("App: no handler for path: " + req.path);
      next();
    }
  });


  return app;
}