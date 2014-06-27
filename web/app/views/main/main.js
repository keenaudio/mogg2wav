define(['angular'], function(angular) {
  angular.module("keenaudio").directive("kMain", function() {
    return {
      restrict: 'A',
      link:function ($scope, $elem, attr) {
        NG.attachScopeToElem($scope, $elem);
        console.log("main view loaded");
      }
    };
  });
});