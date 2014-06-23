angular.module("keenaudio").directive("kPlayButton", function(app) {
  return {
    restrict: 'A',
    templateUrl: 'components/play_button/play_button.jade',
    scope: {
      url: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("play button loaded");
      $scope.enabled = false;
      $scope.status = '';
      $scope.state = 'loading';
      $scope.percent = .5;

      function loadAudio() {
        app.loadAudio($scope.url, function onProgress(percent) {
          $scope.$apply(function() {
            $scope.percent = percent;
            $scope.status = Math.round(percent * 100) + '%';
          });

        }, function onDone(data) {
          var audio = Object.create(WaveSurfer.WebAudio);
          audio.init({
            audioContext: app.audioContext()
          });
          audio.loadData(data, function() {
            $scope.$apply(function() {
              $scope.audio = audio;
              $scope.loaded = true;
              $scope.status = 'loaded';
              $scope.state = 'playing';
            });
          });
        });

      }

      $scope.onClick = function() {
        if (!$scope.state === 'loading') {
          return;
        }

        if (!$scope.loaded) {
          $scope.state = 'loading';
          loadAudio();
          return;
        }

        if ($scope.state === "paused") {
          $scope.state = "playing";
        } else {
          $scope.state = "paused";
        }
      }

      $scope.$watch('url', function(url) {
        if (url) {
          $scope.enabled = true;
          $scope.state = "paused";
        }
      });

      $scope.$watch('state', function(state) {
        if (!$scope.audio) return;
        if (state === 'playing') {
          if ($scope.audio.isPaused()) {
            $scope.audio.play();
          }
        } else if (state === 'paused') {
          if (!$scope.audio.isPaused()) {
            $scope.audio.pause();
          }
        }
      });
    }
  };
});