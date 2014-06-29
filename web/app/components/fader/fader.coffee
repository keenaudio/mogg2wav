define [
  "assert"
  "angular"
  "ng"
  "ng/receiver"
], (assert, angular, NG, Receiver) ->
  angular.module("keenaudio").directive "kFader", ($http, $routeParams) ->
    restrict: "A"
    scope:
      track: "="
      node: "="

    templateUrl: "components/fader/fader.jade"
    link: ($scope, $elem, attr) ->
      NG.attachScopeToElem $scope, $elem
      
      #$scope.receiver = new Receiver($scope);
      #$scope.receiver.listen()
      $scope.level = 80
      $scope.$watch "level", (level) ->
        assert not isNaN(level) #@strip
        val = level / 100
        console.log "Fader: setting value: " + val + " on node: " + $scope.node
        $scope.node.gain.value = val  if $scope.node
        return

      return

  return
