#the require library is configuring paths
require.config
  paths:
    ng: "/lib/ng"
    audio: "/lib/audio"
    formats: "/lib/formats"
    views: "../views"
    components: "../components"
    appTemplates: "app-templates"
    lib: "/lib"
    merge: "/lib/common/merge"
    assert: "/lib/common/assert"
    dispatcher: "/lib/common/dispatcher"

    #tries to load jQuery from Google's CDN first and falls back
    #to load locally
    jquery: [
      "//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min"
      "/bower_components/jquery/dist/jquery"
    ]
    jqueryUI: "/bower_components/jquery-ui/ui/jquery-ui"
    underscore: "/bower_components/underscore/underscore"
    bootstrap: "/bower_components/bootstrap/dist/js/bootstrap"
    angular: [
     # "//ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular.min"
      "/bower_components/angular/angular"
    ]
    angularRoute: [
      "//ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular-route.min"
      "/bower_components/angular/angular-route"
    ]
    angularUISlider: "/bower_components/angular-ui-slider/src/slider"

  shim:
    bootstrap:
      deps: ["jqueryUI"]

    angular:
      deps: ["jquery"]
      exports: "angular"

    angularRoute: ["angular"]
    angularMocks:
      deps: ["angular"]
      exports: "angular.mock"
    angularUISlider:
      deps: ["angular", "jqueryUI"]
      exports: "angular"

    #jquery
    #  exports: "jQuery"
    jqueryUI:
      deps: ["jquery"]
      exports: "$"

    appTemplates:
      deps: ["angular"]
      exports: "angular"

    app:
      deps: [
        "jquery"
        "jqueryUI"
        "underscore"
        "bootstrap"
        "angular"
        "angularRoute"
        "angularUISlider"
        "ng/config"
        "appTemplates"
        "audio"
      ]


  priority: ["angular"]
  
  # how long the it tries to load a script before giving up, the default is 7
  waitSeconds: 10


# requiring the scripts in the first argument and then passing the library namespaces into a callback
# you should be able to console log all of the callback arguments
require [
  "angular"
  "app"
], (angular, app) ->
  
  require [
    "views/main/main"
    "views/als/als"
    "views/folders/folders"
    "views/project/project"
    "components/fader/fader"
    "components/main_nav/main_nav"
    "components/play_button/play_button"
    "components/play_clip/play_clip"
    "components/set/set"
    "components/vu_meter/vu_meter"
    "components/track_header/track_header"
    "components/track_controls/track_controls"
  ], () ->

    # Load the config, then bootstrap the app
    serverConfig = window["serverConfig"]
    initConfig = angular.module("config").init(serverConfig)
    bootstrap = (config) ->
      console.log "Doing bootstrap now" #@strip
      angular.element(document).ready ->
        angular.bootstrap document, [app["name"]]
        return

      return

    initConfig.then bootstrap if initConfig
    return

  return
