angular.module("keenaudio").directive("kMain", function() {
  return {
    restrict: 'A',
    link:function (scope, $elem, attr) {
      console.log("main view loaded");
    }
  };
});