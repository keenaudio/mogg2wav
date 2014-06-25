
angular.module("keenaudio").directive("kSet", function($http, $routeParams) {
  return {
    restrict: 'A',
    scope: {
      set: '='
    },
    templateUrl: 'components/set/set.jade',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);

      $scope.model = new PlayerModel();
      
     }
  };
});
