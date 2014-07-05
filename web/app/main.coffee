# require.config
#     paths:
#         appTemplates: "app/scripts/app-templates"

#     shim:
#         appTemplates:
#           deps: ["angular"]
#           exports: "angular"

define [
    "require"
    "jquery"
    "jqueryUI"
    "underscore"
    "bootstrap"
    "angular"
    "angularRoute"
    "angularUISlider"
    "ng/config"
    "audio"
    "appTemplates"
    "daw"
], (require, $, jqueryUI, _, bootstrp, angular, ngRoute, ngUISlider, config, audio, appTemplates, daw) ->
    console.log "App: requiring pieces.  daw ready? " + daw.ready

    # return
    require [
        "./module"
        "./directives/sortable"
        "./directives/overlay"
        "./views/main/main"
        "./views/als/als"
        "./views/folders/folders"
        # "views/project/project"
        "./views/export/export"
        # "components/fader/fader"
        "./components/main_nav/main_nav"
        # "components/play_button/play_button"
        # "components/play_clip/play_clip"
        # "components/set/set"
        # "components/vu_meter/vu_meter"
        # "components/track_header/track_header"
        # "components/track_controls/track_controls"
        # "components/master_controls/master_controls"
        # "components/panner/panner"
        # "components/track_mixer/track_mixer"
    ], (app) ->

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