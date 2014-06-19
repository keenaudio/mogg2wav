'use strict';

// global externals
var Server; // injected by express in index.jade

(function() {

  //@if LOG
  var _ls = "App.app";
  var _f = function(msg) { return "[" + _ls + "] " + msg; }
  //@end

  var locals = {};

  // Define the global app instance.
  var app = angular.module('keenaudio', [ // Module dependencies
    'ngRoute'
  ]);

  app.run(function()  {
    console.log(_f("keenaudio app running")); //@strip
  });
})();
