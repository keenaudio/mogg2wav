define(['angular', 'ng', 'audio'], function(angular, NG, audio) {
  angular.module("keenaudio").directive("kSet", function($http, $routeParams, app) {
    return {
      restrict: 'A',
      scope: {
        set: '='
      },
      templateUrl: 'components/set/set.jade',
      link:function ($scope, $elem, attr) {
        NG.attachScopeToElem($scope, $elem);

        $scope.playable = new audio.Playable("Set");
        $scope.$watch('playable.state', function(state, prev) {
          console.log('Set playable.state: ' + prev + ' => ' + state);
          if (state === 'playing') {
            app.playSet($scope.set);
          } else if (state === 'paused') {
            app.pauseSet($scope.set);
          }
        });
       }
    };
  });
});
