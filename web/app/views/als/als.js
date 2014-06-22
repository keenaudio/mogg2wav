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
        $scope.project = data;
        $scope.tracks = data.Ableton.LiveSet[0].Tracks[0].AudioTrack;
      });
    }
  };
});

angular.module("keenaudio").directive("kAlsTrack", function() {
  return {
    restrict: 'A',
    templateUrl: 'views/als/als_track.jade',
    scope: {
      track: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      console.log("track view loaded: " + $scope.track);
      $scope.$watch('track', function(track) {
        if (!track) return;
        $scope.name = track.Name[0].UserName[0].$.Value;
        console.log("Setting name: " + $scope.name);
        $scope.slots = track.DeviceChain[0].MainSequencer[0].ClipSlotList[0].ClipSlot;
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
        $scope.clip = slot.ClipSlot[0].Value[0];
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
        $scope.sample = clip.AudioClip[0].SampleRef[0];
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
        $scope.fileName = sample.FileRef[0].Name[0].$.Value;
      });
      
    }
  };
});



