
angular.module("keenaudio").directive("kSet", function($http, $routeParams, app) {
  return {
    restrict: 'A',
    scope: {
      set: '='
    },
    templateUrl: 'components/set/set.jade',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);

      $scope.model = new PlayerModel();
      $scope.$watch('model.state', function(state, prev) {
        console.log('Set saw model.state: ' + prev + ' => ' + state);
        if (state === 'playing') {
          app.playSet($scope.set);
        }
      });
     }
  };
});
