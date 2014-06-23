angular.module("keenaudio").directive("kFolders", function($http) {
  return {
    restrict: 'A',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $http.get('/json/folders').success(function(data) {
        $scope.folders = data;
      });
    }
  };
});

angular.module("keenaudio").directive("kFolder", function($http, $routeParams) {
  return {
    restrict: 'A',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $http.get('/json/folder/' + $routeParams.folder).success(function(data) {
        $scope.files = data;
      });
    }
  };
});

angular.module("keenaudio").directive("kFile", function($routeParams, config) {
  return {
    restrict: 'A',
    templateUrl: 'views/folders/file.jade',
    scope: {
      file: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $scope.$watch('file', function(file) {
        if (!file) return;
        $scope.fileName = file;
        $scope.url = config.get('routes.folders') + '/' + $routeParams.folder + '/' + file;
      });
    }
  };
});