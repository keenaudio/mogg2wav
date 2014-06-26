//the require library is configuring paths
require.config({
    paths: {
        //tries to load jQuery from Google's CDN first and falls back
        //to load locally
        "jquery": ["//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
                    "/bower_components/jquery/dist/jquery"],
        "jqueryUi": "/bower_components/jquery-ui/ui/jquery-ui",
        "underscore": "/bower_components/underscore/underscore",
        "angular": [
            "//ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular.min",
            "/bower_components/angular/angular"
        ],
        "angularRoute": [
            "//ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular-route.min",
            "/bower_components/angular/angular-route"
        ],
        "angularUiSlider": "/bower_components/angular-ui-slider/src/slider"
    },
    shim: {
        'angular' : {'exports' : 'angular'},
        'angularRoute': ['angular'],
        'angularMocks': {
            deps:['angular'],
            'exports':'angular.mock'
        }
    },
    priority: [
        "angular"
    ],
        // how long the it tries to load a script before giving up, the default is 7
    waitSeconds: 10
});

// requiring the scripts in the first argument and then passing the library namespaces into a callback
// you should be able to console log all of the callback arguments
require(['jquery', 'underscore', 'angular'], function($, _, angular){
    debugger;
});
