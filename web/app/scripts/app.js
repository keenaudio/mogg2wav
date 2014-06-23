'use strict';

// global externals
var clientConfig; // injected in app.jade

(function() {

  //@if LOG
  var _ls = "App.app";
  var _f = function(msg) { return "[" + _ls + "] " + msg; }
  //@end

  var locals = {};

  // Define the global app instance.
  var app = angular.module('keenaudio', [ // Module dependencies
    'ngRoute',
    'config',
    'app-templates'
  ]);

  app.config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main/main.jade'
      })
      .when('/folders', {
        templateUrl: 'views/folders/folders_index.jade'
      })
      .when('/folder/:folder', {
        templateUrl: 'views/folders/folder.jade'
      })
      .when('/als', {
        templateUrl: 'views/als/als_index.jade'
      })
      .when('/als/project/:project', {
        templateUrl: 'views/als/als_project.jade'
      })
      .otherwise({redirect:'/'});


    // configure html5 to get links working on jsfiddle
    //$locationProvider.html5Mode(true);
  });

  app.service('app', function() {
    var ac = new (window.AudioContext || window.webkitAudioContext);

    return {
      audioContext: function() {
        return ac;
      },
      loadAudio: function(url, progressCallback, doneCallback) {

        var my = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
                var percentComplete = e.loaded / e.total;
            } else {
                // TODO
                percentComplete = 0;
            }
            if (progressCallback) {
              progressCallback(percentComplete, e.loaded, e.total);
            }
            //my.drawer.drawLoading(percentComplete);
        }, false);

        xhr.addEventListener('load', function (e) {
          if (doneCallback) {
            doneCallback(e.target.response);
          }
            // my.backend.loadData(
            //     e.target.response,
            //     my.drawBuffer.bind(my)
            // );
        }, false);
        xhr.send();
      }
    }
  });

  app.run(function()  {
    console.log(_f("keenaudio app running")); //@strip
  });

    // Load the config, then bootstrap the app
  var initConfig = angular.module('config').init(clientConfig);
  var bootstrap = function(config) {
    console.log(_f("Doing bootstrap now")); //@strip
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['keenaudio']);
    });
  };

  if (initConfig) {
    initConfig.then(bootstrap);
  }
})();
