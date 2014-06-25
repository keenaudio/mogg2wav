var audio; // global import

(function() {
  'use strict';


  var AudioTrack = function(audioContext, masterGainNode) {
    this.audioContext = audioContext;

    var trackMasterGainNode = ac.createGain();
    var trackInputNode = ac.createGain();
    var trackVolumeNode = ac.createGain();

    trackMasterGainNode.connect(masterGainNode);
    trackVolumeNode.connect(trackMasterGainNode);
    trackInputNode.connect(trackVolumeNode);

    this.nodes = {
      gain: trackMasterGains,
      volume: trackVolumeNode,
      input: trackInputNode
    };

  };

  // AudioTrack.prototype.addSample = function(sample) {
  //   this.samples.push(sample);
  //   sample.id = this.samples.length - 1;

  //   var that = this;
  //   sample.load(function(err) {
  //     if (err) {
  //       console.error("Error loading sample: " + sample.url + " : " + err);
  //       return;
  //     }

  //     var source = that.audioContext.createBufferSource();
  //     var dest = that.nodes.input
  //     source.connect(dest);
  //     source.buffer = sample.buffer;
      
  //     //push source node and the scheduled start time of the sample
  //     // activeSources.push({sourceNode: source, sourceStartBar: beatNumber});
  //     // source.start(noteTime);

  //   });
  // };


  // export
  audio.Track = AudioTrack;

})();