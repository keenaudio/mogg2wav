# require.config
#     paths:
#         dawTemplates: "daw/scripts/daw-templates"

#     shim:
#         dawTemplates:
#           deps: ["angular"]
#           exports: "angular"

define [
    "module"
    "require"
    "jquery"
    "jqueryUI"
    "underscore"
    "bootstrap"
    "angular"
    "angularUISlider"
    "ng/config"
    "audio"
    "dawTemplates"
    "./module"
], (module, require, $, jqueryUI, _, bootstrp, angular, ngUISlider, config, audio, dawTemplates, daw) ->
  console.log "DAW: including pieces"

  console.log("DAW index MODULE: " + JSON.stringify(module));
  console.log("DAW index CONFIG: " + JSON.stringify(module.config()));


  require [
      "./views/project/project"
      "./components/fader/fader"
      "./components/play_button/play_button"
      "./components/play_clip/play_clip"
      "./components/set/set"
      "./components/vu_meter/vu_meter"
      "./components/track_header/track_header"
      "./components/track_controls/track_controls"
      "./components/master_controls/master_controls"
      "./components/panner/panner"
      "./components/track_mixer/track_mixer"
  ], () ->

      console.log "DAW module loaded"
      daw.ready = true

      return

  return daw