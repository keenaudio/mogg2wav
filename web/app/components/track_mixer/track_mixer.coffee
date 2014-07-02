define [
  "angular"
  "ng"
], (angular, NG) ->
  angular.module("keenaudio").directive "kTrackMixer", (app) ->
    restrict: "A"
    replace: true
    scope:
      track: "="
    templateUrl: "components/track_mixer/track_mixer.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      $scope.app = app
      return

  return
