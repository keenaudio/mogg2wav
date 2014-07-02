define ["angular", "ng"], (angular, NG) ->
  angular.module("keenaudio").directive "kExport", ->
    restrict: "A"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      console.log "export view loaded"

      $scope.$watch "project", (project) ->
        $scope.text = JSON.stringify project, null, 2
        $scope.saveAs = project.name + "." + new Date().getTime() + ".json"
        return
        
      return

  return
