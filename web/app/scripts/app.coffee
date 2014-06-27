define [
  "module"
  "angular"
], (module, angular) ->
  
  #@if LOG
  _ls = "App.app"
  _f = (msg) ->
    "[" + _ls + "] " + msg

  
  #@end
  locals = {}
  
  # Define the global app instance.
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
    ac = new (window.AudioContext or window.webkitAudioContext)
    $rootScope.mixer = new audio.Mixer(ac)
    $rootScope.scheduler = new audio.Scheduler(ac)
    appSvc =
      audioContext: ->
        ac

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
        $rootScope.mixer = new audio.Mixer(ac)
        $rootScope.scheduler = new audio.Scheduler(ac)
        return

      setProject: (project) ->
        $rootScope.project = project
        appSvc.clearAudio()
        mixer = $rootScope.mixer
        _.each project.tracks, (track) ->
          mixer.createTrack()
          return

        return

      playSet: (set) ->
        project = $rootScope.project
        scheduler = $rootScope.scheduler
        mixer = $rootScope.mixer
        _.each mixer.tracks, (track) ->
          sampleData = set.getSample(track.id)
          if sampleData
            sample = audio.createSample(sampleData)
            scheduler.addItem sample, track, 0
          return

        scheduler.play()
        return

    appSvc

  app.run ->
    console.log _f("keenaudio app running") #@strip
    return

  return app
