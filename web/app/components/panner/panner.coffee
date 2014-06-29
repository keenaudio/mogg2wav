define [
  "assert"
  "angular"
  "ng"
  "ng/receiver"
], (assert, angular, NG, Receiver) ->
  angular.module("keenaudio").directive "kPanner", ($http, $routeParams) ->
    restrict: "A"
    scope:
      panner: "="

    templateUrl: "components/panner/panner.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      
      #$scope.receiver = new Receiver($scope);
      #$scope.receiver.listen()
      $scope.value = 50
      $scope.$watch "value", (value) ->
        assert not isNaN(value) #@strip
        console.log "Panner: setting value: " + val + " on panner: " + $scope.panner
        #$scope.node.gain.value = val  if $scope.node
        return

      return

  return
