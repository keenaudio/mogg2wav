define(['angular', 'ng', 'audio'], function(angular, NG, audio) {
  angular.module("keenaudio").directive("kPlayClip", function($http, $routeParams, app) {
    return {
      restrict: 'A',
      scope: {
        clip: '='
      },
      templateUrl: 'components/play_clip/play_clip.jade',
      link:function ($scope, $elem, attr) {
        NG.attachScopeToElem($scope, $elem);

        // function loadAudio() {
        //   app.loadAudio($scope.clip.url, function onProgress(percent) {
        //     $scope.$apply(function() {
        //       $scope.model.percent = percent;
        //       $scope.model.status = Math.round(percent * 100) + '%';
        //     });
        //   }, function onDone(data) {
        //     var audio = Object.create(WaveSurfer.WebAudio);
        //     audio.init({
        //       audioContext: app.audioContext()
        //     });
        //     audio.loadData(data, function() {
        //       $scope.$apply(function() {
        //         $scope.model.audio = audio;
        //         $scope.model.loaded = true;
        //        // $scope.status = 'loaded';
        //         $scope.model.state = 'playing';
        //       });
        //     });
        //   });

        // }

        // $scope.$watch('clip.state', function(state, prev) {
        //   console.log('clip.state: ' + prev + ' => ' + state);
        //   if (state === 'playing' && !$scope.model.loaded) {
        //     $scope.model.state = 'loading';
        //     loadAudio();
        //   }
        // });
      }
    };
  });
});
