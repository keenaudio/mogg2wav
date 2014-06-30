define [
  "angular"
  "ng"
], (angular, NG) ->
  angular.module("keenaudio").directive "kProject", ($http, $routeParams, config, app) ->
    restrict: "A"
    templateUrl: "views/project/project.jade"
    scope:
      project: "="

    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      $scope.$watch "project", (project) ->
        return  unless project
        mixer = app.getMixer()
        scheduler = app.getScheduler()
        $scope.mixer = mixer
        $scope.scheduler = scheduler
        return

      $sets = $elem.find(".project-sets")
      $trackHeaders = $elem.find(".track-headers")
      $trackMixer = $elem.find(".track-mixer")
      $scrollContainer = $elem.find(".scroll-container")
      $scrollContainer.scroll (e) ->
        console.log "scroll: " + $scrollContainer.scrollLeft() + " , " + $scrollContainer.scrollTop()
        l = $scrollContainer.scrollLeft()
        t = $scrollContainer.scrollTop()
        $trackHeaders.css "top", t
        $sets.css "right", -l
        
        #$sets.css('top', -t);
        #$trackMixer.css('left', -l);
        $trackMixer.css "bottom", -t
        return

      $scope.getClip = (setId, trackId) ->

      return

  return
