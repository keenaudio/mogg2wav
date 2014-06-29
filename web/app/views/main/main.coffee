define ["angular", "ng"], (angular, NG) ->
  angular.module("keenaudio").directive "kMain", ->
    restrict: "A"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      console.log "main view loaded"
      return

  return
