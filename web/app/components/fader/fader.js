define(['angular', 'ng'], function(angular, NG) {
  angular.module("keenaudio").directive("kFader", function($http, $routeParams) {
    return {
      restrict: 'A',
      scope: {
        track: '=',
        gainNode: '='
      },
      templateUrl: 'components/fader/fader.jade',
      link:function ($scope, $elem, attr) {
        NG.attachScopeToElem($scope, $elem);

        $scope.level = 80;
      }
    };
  });
});
