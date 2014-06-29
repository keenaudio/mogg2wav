define [
  "angular"
  "ng"
], (angular, NG) ->
  angular.module("keenaudio").directive "kMasterControls", ($http, $routeParams, $rootScope) ->
    restrict: "A"
    templateUrl: "components/master_controls/master_controls.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem

      $rootScope.$watch "mixer", (mixer) ->
        $scope.mixer = mixer
      
  return
