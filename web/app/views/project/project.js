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

      var $sets = $elem.find('.project-sets');
      var $trackHeaders = $elem.find('.track-headers');
      var $trackMixer = $elem.find('.track-mixer');

      var $scrollContainer = $elem.find('.scroll-container');
      $scrollContainer.scroll(function(e) {
        console.log('scroll: ' + $scrollContainer.scrollLeft() + " , " + $scrollContainer.scrollTop());
        var l = $scrollContainer.scrollLeft();
        var t = $scrollContainer.scrollTop();
        $trackHeaders.css('top', t);
        $sets.css('right', -l)
        //$sets.css('top', -t);
        //$trackMixer.css('left', -l);
        $trackMixer.css('bottom', -t);

      });
    }
  };
});

