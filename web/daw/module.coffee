define [
  "assert"
  "module"
  "angular"
  "audio"
  "dawTemplates"
  "angularUISlider"
], (assert, module, angular, audio, dawTemplates) ->
  
  console.log("DAW MODULE: " + JSON.stringify(module));
  console.log("DAW CONFIG: " + JSON.stringify(module.config()));
  config = module.config()
  moduleName = config.name
  assert moduleName, "Need a module name"

  #@if LOG
  _ls = "Daw.daw"
  _f = (msg) ->
    "[" + _ls + "] " + msg

  #@end
  locals = {}
  
  # Define the app instance.
  app = angular.module(moduleName, [ # Module dependencies
    "ui.slider"
    "config"
    "daw-templates"
  ])

  # configure html5 to get links working on jsfiddle
  #$locationProvider.html5Mode(true);
  app.service "daw", () ->


    svc =
      mixer: audio.createMixer()
      scheduler: audio.createScheduler()

      audioContext: ->
        audio.context()

      loadAudio: (url, progressCallback, doneCallback) ->
        my = this
        xhr = new XMLHttpRequest()
        xhr.open "GET", url, true
        xhr.responseType = "arraybuffer"
        xhr.addEventListener "progress", ((e) ->
          if e.lengthComputable
            percentComplete = e.loaded / e.total
          else
            # TODO
            percentComplete = 0
          progressCallback percentComplete, e.loaded, e.total  if progressCallback
          return
        
        #my.drawer.drawLoading(percentComplete);
        ), false
        xhr.addEventListener "load", ((e) ->
          doneCallback e.target.response  if doneCallback
          return
        
        # my.backend.loadData(
        #     e.target.response,
        #     my.drawBuffer.bind(my)
        # );
        ), false
        xhr.send()
        return

      getMixer: ->
        svc.mixer

      getScheduler: ->
        svc.scheduler

      clearAudio: ->
        return

      setProject: (project) ->
        svc.project = project
        svc.clearAudio()
        mixer = svc.mixer
        _.each project.tracks, (trackData) ->
          track = mixer.createTrack()
          _.each project.sets, (set) ->
            sampleData = set.getSample(track.id)
            if sampleData
              sample = audio.createSample(sampleData)
              clip = new audio.Clip(sample, track)
              track.addClip(clip, set.id)
          return

        return

      playSet: (set) ->
        project = svc.project
        scheduler = svc.scheduler
        mixer = svc.mixer
        _.each mixer.tracks, (track) ->
          clip = track.getClip(set.id)
          if clip
            #sample = audio.createSample(sampleData)
            #clip = new audio.Clip(sample, track)
            scheduler.addClip clip, 0
          return

        scheduler.play()
        return

      pauseSet: (set) ->
        svc.scheduler.stop()
        return

      linkTrack: (track) ->
        if track.linked
          track.unlink()
          return

        mixer = svc.mixer
        tracks = mixer.tracks
        if track.id < tracks.length - 1
          nextTrack = tracks[track.id+1]
          track.linkTo nextTrack
        return

      exportProject: (options) ->
        project = svc.project
        mixer = svc.mixer

        projectTracks = project.tracks
        mixerTracks = mixer.tracks
        
        exportTracks = projectTracks.map (pt, i) ->
          mt = mixerTracks[i];
          pt.pan = mt.panner.getValue()
          if mt.linked
            pt.link = mt.linkedTo.id
          return pt

        exportStr = JSON.stringify project, (key, value) ->
          return undefined if key == "$$hashKey"
          return value

        console.log _f("exportProject")
        return exportStr


    svc.clearAudio()
    return svc

  app.run ->
    console.log _f("daw app running") #@strip
    return

  return app
