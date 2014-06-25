angular.module("keenaudio").directive("kPlayButton", function(app) {
  return {
    restrict: 'A',
    templateUrl: 'components/play_button/play_button.jade',
    scope: {
      model: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);

      // $scope.status = '';
      // $scope.state = 'loading';
      // $scope.percent = .5;

      // function loadAudio() {
      //   app.loadAudio($scope.url, function onProgress(percent) {
      //     $scope.$apply(function() {
      //       $scope.percent = percent;
      //       $scope.status = Math.round(percent * 100) + '%';
      //     });

      //   }, function onDone(data) {
      //     var audio = Object.create(WaveSurfer.WebAudio);
      //     audio.init({
      //       audioContext: app.audioContext()
      //     });
      //     audio.loadData(data, function() {
      //       $scope.$apply(function() {
      //         $scope.audio = audio;
      //         $scope.loaded = true;
      //         $scope.status = 'loaded';
      //         $scope.state = 'playing';
      //       });
      //     });
      //   });

      // }

      $scope.onClick = function() {
        if (!$scope.model.state === 'loading') {
          return;
        }

        // if (!$scope.loaded) {
        //   $scope.state = 'loading';
        //   loadAudio();
        //   return;
        // }

        if ($scope.model.state === "paused") {
          $scope.model.state = "playing";
        } else {
          $scope.model.state = "paused";
        }
      }

      // $scope.$watch('url', function(url) {
      //   if (url) {
      //     $scope.enabled = true;
      //     $scope.state = "paused";
      //   }
      // });

      $scope.$watch('model.state', function(state) {
        if (!state) return;
        if (!$scope.model.audio) return;
        var audio = $scope.model.audio;
        if (state === 'playing') {
          if (audio.isPaused()) {
            audio.play();
          }
        } else if (state === 'paused') {
          if (!audio.isPaused()) {
            audio.pause();
          }
        }
      });
    }
  };
});