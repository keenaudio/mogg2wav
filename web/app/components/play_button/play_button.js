define(['assert', 'angular', 'ng', 'ng/receiver'], function(assert, angular, NG, Receiver) {
  angular.module("keenaudio").directive("kPlayButton", function(app) {
    return {
      restrict: 'A',
      templateUrl: 'components/play_button/play_button.jade',
      scope: {
        playable: '=',
        loadable: '='
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

        $scope.state = 'init';

        var receiver = new Receiver($scope);

        function updateState() {
          var prev = $scope.state;
          if (loading()) {
            $scope.state = 'loading';
          } else {
            $scope.state = $scope.playable ? $scope.playable.state : 'empty';
          }
          console.log("playButton: state " + prev + " => " + $scope.state);
        }

        function loading() {
          var loadable = $scope.loadable;
          if (!loadable) return false;
          return loadable.loading;
        }

        function loaded() {
          var loadable = $scope.loadable;
          if (!loadable) return true;
          return loadable.loaded;
        }

        function play() {
          var playable = $scope.playable;
          assert(playable, "need a playable object");
          playable.play();
        }

        $scope.onClick = function() {
          if (loading()) {
            return;
          }

          if (!loaded()) {
            console.log("play button: Loading clip and then playing");
            $scope.loadable.load(play);
            return;
          }
          // if (!$scope.loaded) {
          //   $scope.state = 'loading';
          //   loadAudio();
          //   return;
          // }

          play();
        }

        function propListener(prop, val, prev) {
          console.log("CHANGE: " + prop + " : " + val + " : " + prev);
          updateState();
        }

        function attachReceiver(cur, prev) {
          if (prev && prev !== cur) {
            receiver.stopListening("change", prev);
          }
          if (cur) {
            receiver.listen("change", cur);
          }
        }

        $scope.$watch('playable', attachReceiver);
        $scope.$watch('loadable', attachReceiver);

        $scope.$watch('playable.state', updateState);
        $scope.$watch('loadable.loading', updateState);


      }
    };
  });
});