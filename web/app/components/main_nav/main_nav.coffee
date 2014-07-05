define [
  "../../module"
  "angular"
  "ng"
], (module, angular, NG) ->
  angular.module(module["name"]).directive "kMainNav", ($http, $routeParams, $rootScope, app) ->
    restrict: "A"
    templateUrl: "components/main_nav/main_nav.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      $scope.playPause = ->
        console.log "playPause"
        $rootScope.scheduler.play()  if $rootScope.scheduler
        return

      $scope.stop = ->
        console.log "stop"
        $rootScope.scheduler.stopAll()  if $rootScope.scheduler
        return

      $scope.export = ->
        project = $rootScope.project
        projectTracks = project.tracks
        mixer = $rootScope.mixer
        mixerTracks = mixer.tracks
        projectTracks.forEach (pt, i) ->
          mt = mixerTracks[i];
          pt.pan = mt.panner.getValue()
          if mt.linked
            pt.link = mt.linkedTo.id
          return

        app.showOverlay "export",
          project: project


        console.log JSON.stringify project, null, 2
        return

      return

  return


# $rootScope.$watch('project', function(project) {
#   $scope.project = project;
# })