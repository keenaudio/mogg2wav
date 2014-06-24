angular.module("keenaudio").directive("kTrackHeader", function($http, $routeParams) {
  return {
    restrict: 'A',
    scope: {
      track: '='
    },
    templateUrl: 'components/track_header/track_header.jade',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $scope.selected = false;
    }
  };
});
