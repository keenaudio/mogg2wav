define(['angular', 'ng'], function(angular, NG) {
  angular.module("keenaudio").directive("kMainNav", function($http, $routeParams, $rootScope) {
    return {
      restrict: 'A',
      templateUrl: 'components/main_nav/main_nav.jade',
      link:function ($scope, $elem, attr) {
        NG.attachScopeToElem($scope, $elem);
        $scope.playPause = function() {
          console.log('playPause');
          if ($rootScope.scheduler) {
            $rootScope.scheduler.play();
          }
        }
        $scope.stop = function() {
          console.log('stop');
          if ($rootScope.scheduler) {
            $rootScope.scheduler.stopAll();
          }

        }

        // $rootScope.$watch('project', function(project) {
        //   $scope.project = project;
        // })
      }
    };
  });
});