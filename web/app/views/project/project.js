angular.module("keenaudio").directive("kProject", function($http, $routeParams, config, app) {
  return {
    restrict: 'A',
    templateUrl: 'views/project/project.jade',
    scope: {
      project: '='
    },
    link:function ($scope, $elem, attr) {
      NG.attachScopeToElem($scope, $elem);
      
      $scope.$watch('project', function(project) {
        if (!project) return;

        app.clearAudio();
        var mixer = app.getMixer();
        var scheduler = app.getScheduler();

        _.each(project.samples, function(elem) {
          var sample = audio.createSample(elem);
          var track = mixer.createTrack();
          scheduler.addItem(sample, track, 0);
        });

      });
    }
  };
});

