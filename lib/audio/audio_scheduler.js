var audio; // global import

(function() {
  'use strict';


  var AudioScheduler = function(audioContext) {
    this.audioContext = audioContext;
    //this.mixer = mixer;
    this.activeSources = [];
  };

  AudioScheduler.prototype.schedulePlay = function(sample, track, startTime) {

    var inputNode = track.nodes.input;

    var that = this;
    sample.load(function(err) {
      if (err) {
        console.error("Error loading sample: " + sample.url + " : " + err);
        return;
      }

      var source = that.mixer.audioContext.createBufferSource();
      var dest = inputNode;
      source.connect(dest);
      source.buffer = sample.buffer;
      
      //push source node and the scheduled start time of the sample
      activeSources.push({source: source, startTime: startTime});
      source.start(startTime);

    });
  };

  AudioScheduler.prototype.play = function() {
    var currentTime = this.audioContext.currentTime;
    activeSources.forEach(function(element, index){
      //var percent = (current16thNote-element.sourceStartBar) / (element.sourceNode.buffer.duration/(secondsPerBeat*0.25));
      //element.sourceNode.start(element.sourceNode.buffer.duration * percent);
      element.sourceNode.start(currentTime);
    });

  }

  AudioScheduler.prototype.stopAll = function() {
    activeSources.forEach(function(element){
      element.sourceNode.stop(0);
    });
  }


  // export
  audio.Scheduler = AudioScheduler;

})();