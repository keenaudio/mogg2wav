var audio; // global import

(function() {
  'use strict';


  var AudioScheduler = function(audioContext) {
    this.audioContext = audioContext;
    //this.mixer = mixer;
    this.items = []
    this.activeSources = [];
    this.samplesToLoad = 0;
  };

  AudioScheduler.prototype.clearAll = function() {
    this.stopAll();
    this.activeSources = [];
  }

  AudioScheduler.prototype.addItem = function(sample, track, startTime) {
    var item = {
      sample: sample,
      track: track,
      startTime: startTime,
      loaded: false,
      source: undefined
    };
    this.items.push(item);
    item.id = this.items.length - 1;
    return item;

  };

  AudioScheduler.prototype.play = function() {
    if (this.samplesToLoad) {
      console.log("AudioScheduler: cannot play beause waiting for samples");
      return;
    }

    var currentTime = this.audioContext.currentTime;

    console.log("AudioScheduler: play(): " + currentTime);

    this.samplesToLoad = 0;
    var that = this;
    this.items.forEach(function(item) {
      if (item.startTime <= currentTime && item.loaded === false) {
        that.samplesToLoad++;
        var sample = item.sample;
        var track = item.track;
        sample.load(function(err) {
          that.samplesToLoad--;
          item.loaded = true;

          if (err) {
            console.error("Error loading sample: " + sample.url + " : " + err);
          } else {

            var source = that.audioContext.createBufferSource();
            var dest = track.nodes.input;
            source.connect(dest);
            source.buffer = sample.buffer;
            
            //push source node and the scheduled start time of the sample
            that.activeSources.push({source: source, startTime: item.startTime, item: item});
           // source.start(startTime);
          }

          if (that.samplesToLoad === 0) {
            that.play()
          }
        });
      }
    });

    if (this.samplesToLoad) {
      console.log("AudioScheduler: returning from play waiting for samples");
      return;
    }

    console.log("AudioScheduler: playing all activeSources at currentTime")
    var currentTime = this.audioContext.currentTime;
    this.activeSources.forEach(function(element, index){
      //var percent = (current16thNote-element.sourceStartBar) / (element.sourceNode.buffer.duration/(secondsPerBeat*0.25));
      //element.sourceNode.start(element.sourceNode.buffer.duration * percent);
      element.source.start(currentTime);
    });

  }

  AudioScheduler.prototype.stopAll = function() {
    this.activeSources.forEach(function(element){
      element.source.stop(0);
    });
  }


  // export
  audio.Scheduler = AudioScheduler;

})();