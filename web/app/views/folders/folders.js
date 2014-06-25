angular.module("keenaudio").directive("kFolders", function($http) {
  return {
    restrict: 'A',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $http.get('/json/folders').success(function(data) {
        $scope.folders = data;
      });
    }
  };
});

angular.module("keenaudio").directive("kFolder", function($http, $routeParams, config, app) {
  return {
    restrict: 'A',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $scope.name = $routeParams.folder;
      $http.get('/json/folder/' + $routeParams.folder).success(function(data) {
        $scope.files = data;

        $scope.tracks = _.map(data, function(file) {
          return {
            name: file
          };
        })

        $scope.samples = _.map(data, function(file) {
            return {
              fileName: file,
              url: config.get('routes.folders') + '/' + $routeParams.folder + '/' + file
            };
          });

        var project = new Project($routeParams.folder, 'wavs');
        var set = new Project.Set();

        _.each($scope.tracks, function(track) {
          project.addTrack(new Project.Track(track.name, 'wav')); 
        });

        _.each($scope.samples, function(sample, index) {
          set.addSample(sample, $scope.tracks[index]);       
        });
        project.addSet(set);
        $scope.project = project;

        // app.clearAudio();
        // var mixer = app.getMixer();
        // var scheduler = app.getScheduler();

        // _.each($scope.clips, function(clip) {
        //   var sample = audio.createSample(clip);
        //   var track = mixer.createTrack();
        //   scheduler.addItem(sample, track, 0);
        // });

      });
    }
  };
});

angular.module("keenaudio").directive("kFile", function($routeParams, config) {
  return {
    restrict: 'A',
    templateUrl: 'views/folders/file.jade',
    scope: {
      file: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      $scope.$watch('file', function(file) {
        if (!file) return;
        $scope.fileName = file;
        $scope.url = config.get('routes.folders') + '/' + $routeParams.folder + '/' + file;
      });
    }
  };
});