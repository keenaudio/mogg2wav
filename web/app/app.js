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
    'ngRoute',
    'app-templates'
  ]);

  app.config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main/main.jade'
      })
      .otherwise({redirect:'/'});


    // configure html5 to get links working on jsfiddle
    //$locationProvider.html5Mode(true);
  });

  app.run(function()  {
    console.log(_f("keenaudio app running")); //@strip
  });
})();
