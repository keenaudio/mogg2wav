define [
  "angular"
  "ng"
], (angular, NG) ->
  angular.module("keenaudio").directive "kTrackMixer", () ->
    restrict: "A"
    scope:
      track: "="
    templateUrl: "components/track_mixer/track_mixer.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      
  return
