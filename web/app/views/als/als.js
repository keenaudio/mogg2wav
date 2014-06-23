angular.module("keenaudio").directive("kAlsProjects", function($http, $routeParams) {
  return {
    restrict: 'A',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);

      console.log("als view loaded");
      $http.get('/json/als/projects').success(function(data) {
        $scope.projects = data;
      });
    }
  };
});

angular.module("keenaudio").directive("kAlsProject", function($http, $routeParams) {
  return {
    restrict: 'A',
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("als view loaded");
      $http.get('/json/als/project/' + $routeParams.project).success(function(data) {
        $scope.data = data;
        $scope.name = $routeParams.project;
        $scope.project = new AbletonProject(data);
        $scope.props = $scope.project.props;
        $scope.liveSet = $scope.project.liveSet;
        $scope.tracks = $scope.liveSet.tracks; //data.Ableton.LiveSet[0].Tracks[0].AudioTrack;
        $scope.scenes = $scope.liveSet.scenes;
      });
    }
  };
});

angular.module("keenaudio").directive("kAlsTrack", function() {
  return {
    restrict: 'A',
    templateUrl: 'views/als/als_track.jade',
    scope: {
      track: '=',
      showHeader: '@'
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("track view loaded: " + $scope.track);
      $scope.$watch('track', function(track) {
        if (!track) return;
        $scope.name = track.name; //Name[0].UserName[0].$.Value;
        console.log("Setting name: " + $scope.name);
        $scope.slots = track.slots; //DeviceChain[0].MainSequencer[0].ClipSlotList[0].ClipSlot;
      });
    }
  };
});

angular.module("keenaudio").directive("kAlsClipSlot", function() {
  return {
    restrict: 'A',
    templateUrl: 'views/als/als_slot.jade',
    scope: {
      slot: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("clipslot view loaded");
      $scope.$watch('slot', function(slot) {
        $scope.clip = slot.clip; //ClipSlot[0].Value[0];
      });
      
    }
  };
});

angular.module("keenaudio").directive("kAlsClip", function() {
  return {
    restrict: 'A',
    templateUrl: 'views/als/als_clip.jade',
    scope: {
      clip: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("clipslot view loaded");
      $scope.$watch('clip', function(clip) {
        if (!clip) {
          console.log("No clip passed to k-als-clip");
          return;
        }
        console.log("Setting sample: " + clip.sample);
        $scope.sample = clip.sample; //AudioClip[0].SampleRef[0];
      });
      
    }
  };
});


angular.module("keenaudio").directive("kAlsSample", function() {
  return {
    restrict: 'A',
    templateUrl: 'views/als/als_sample.jade',
    scope: {
      sample: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("sample view loaded");
      $scope.$watch('sample', function(sample) {
        if (!sample) {
          console.log("No Sample passed to k-als-sample");
          return;
        }
        $scope.fileRef = sample.fileRef; //FileRef[0].Name[0].$.Value;
      });
      
    }
  };
});

angular.module("keenaudio").directive("kAlsFileRef", function($routeParams, config) {
  return {
    restrict: 'A',
    templateUrl: 'views/als/als_file_ref.jade',
    scope: {
      fileRef: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("fileRef view loaded");
      $scope.$watch('fileRef', function(fileRef) {
        if (!fileRef) {
          console.log("No Fileref passed to k-als-file-ref");
          $scope.valid = false;
          return;
        }
        $scope.valid = true;
        $scope.fileName = fileRef.fileName; //FileRef[0].Name[0].$.Value;
        $scope.fileRelPath = fileRef.fileRelPath;

        // Generate URL for the file.  Walk back to the project
        var sample = fileRef.parent;
        var clip = sample.parent;
        var slot = clip.parent;
        var track = slot.parent;

        var urlParts = [
          config.get('routes.als'),
          $routeParams.project,
          $scope.fileRelPath,
          $scope.fileName
        ]
        $scope.url = urlParts.join('/');

        //$scope.displayPath = './' + fileRef.fileRelPath + '/' + $scope.fileName;
      });
      
    }
  };
});


