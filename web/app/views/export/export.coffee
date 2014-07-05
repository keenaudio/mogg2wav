define ["../../module", "angular", "ng"], (module, angular, NG) ->
  angular.module(module["name"]).directive "kExport", ($http, config) ->
    restrict: "A"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      console.log "export view loaded"

      $scope.$watch "project", (project) ->
        $scope.text = JSON.stringify project, null, 2
        $scope.saveAs = project.name + "." + new Date().getTime() + ".json"
        return
        
      $scope.post = ->
        req = $http.post config.get("routes.app") + "/post",
          filename: $scope.saveAs
          contents: $scope.text
        return

      return

  return
