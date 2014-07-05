define [
  "assert"
  "module"
  "angular"
  "audio"
], (assert, module, angular, audio) ->
  
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
  app.service "daw", ($rootScope) ->
    svc =
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
        $rootScope.mixer

      getScheduler: ->
        $rootScope.scheduler

      clearAudio: ->
        $rootScope.mixer = audio.createMixer()
        $rootScope.scheduler = audio.createScheduler()
        return

      setProject: (project) ->
        $rootScope.project = project
        appSvc.clearAudio()
        mixer = $rootScope.mixer
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
        project = $rootScope.project
        scheduler = $rootScope.scheduler
        mixer = $rootScope.mixer
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
        $rootScope.scheduler.stop()
        return

      linkTrack: (track) ->
        if track.linked
          track.unlink()
          return

        mixer = $rootScope.mixer
        tracks = mixer.tracks
        if track.id < tracks.length - 1
          nextTrack = tracks[track.id+1]
          track.linkTo nextTrack
        return


    svc.clearAudio()
    return svc

  app.run ->
    console.log _f("daw app running") #@strip
    return

  return app
