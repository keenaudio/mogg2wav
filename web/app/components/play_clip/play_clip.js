angular.module("keenaudio").directive("kPlayClip", function($http, $routeParams) {
  return {
    restrict: 'A',
    scope: {
      clip: '='
    },
    templateUrl: 'components/play_clip/play_clip.jade',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);

    }
  };
});
