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
        
      # setValue = (value, range) ->
      #   rval = value/range
      #   lval = 1 - rval
      #   console.log _f("setValue: %s, r: %s, l: %s"), value, rval, lval
      #   $scope.panner.setPosition lval, 0, rval

      #$scope.receiver = new Receiver($scope);
      #$scope.receiver.listen()
      $scope.value = 50
      $scope.$watch "value", (value) ->
        assert not isNaN(value) #@strip
        console.log "Panner: setting value: " + value + " on panner: " + $scope.panner
        $scope.panner.setValue(value, 100) if $scope.panner
        #$scope.node.gain.value = val  if $scope.node
        return

      return

  return
