define [
  "angular"
  "audio"
], (angular, audio) ->
  
  #@if LOG
  _ls = "App.app"
  _f = (msg) ->
    "[" + _ls + "] " + msg

  
  hathBroken = false
  window["onerror"] = ()->
    debugger if !hathBroken
    hathBroken = true
    return

  #@end
  locals = {}
  
  # Define the app instance.
  app = angular.module("keenaudio", [ # Module dependencies
    "ngRoute"
    "ui.slider"
    "config"
    "app-templates"
  ])
  app.config ($routeProvider, $locationProvider) ->
    $routeProvider.when("/",
      templateUrl: "views/main/main.jade"
    ).when("/folders",
      templateUrl: "views/folders/folders_index.jade"
    ).when("/folder/:folder",
      templateUrl: "views/folders/folder.jade"
    ).when("/als",
      templateUrl: "views/als/als_index.jade"
    ).when("/als/project/:project",
      templateUrl: "views/als/als_project.jade"
    ).otherwise redirect: "/"
    return

  
  # configure html5 to get links working on jsfiddle
  #$locationProvider.html5Mode(true);
  app.service "app", ($rootScope) ->
    appSvc =
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

    appSvc.clearAudio()
    return appSvc

  app.run ->
    console.log _f("keenaudio app running") #@strip
    return

  return app
