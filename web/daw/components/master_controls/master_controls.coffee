define [
  "daw/module"
  "angular"
  "ng"
], (module, angular, NG) ->
  angular.module(module["name"]).directive "dawMasterControls", ($http, $routeParams, $rootScope) ->
    restrict: "A"
    templateUrl: "components/master_controls/master_controls.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem

      $rootScope.$watch "mixer", (mixer) ->
        $scope.mixer = mixer
      
  return
