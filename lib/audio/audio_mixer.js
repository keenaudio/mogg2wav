var audio; // global import

(function() {
  'use strict';

  var AudioMixer = function(audioContext) {
    this.audioContext = audioContext;
    this.tracks = [];
    this.samples = [];
    this.activeSources = [];
    this.buffers = [];

    var masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = .8;
    masterGainNode.connect(audioContext.destination);

    this.nodes = {
      masterGain: masterGainNode,
      trackGain: [],
      trackVolume: [],
      trackInput: []
    };
  };

  AudioMixer.prototype.createTrack = function() {
    var track = new audio.Track(this.audioContext, this.nodes.masterGain);
    return track;
  };

  AudioMixer.prototype.addTrack = function(track) {

    var nodes = this.nodes;
    nodes.trackGain.push({node: track.nodes.gain, isMuted: false, isSolo: false});
    nodes.trackVolume.push(track.nodes.volume);
    nodes.trackInput.push(track.nodes.input);

    this.tracks.push(track);

    track.id = this.tracks.length - 1;
  };

  AudioMixer.prototype.getTrack = function(id) {
    return this.tracks[id];
  }


  // AudioMixer.prototype.addSample = function(sample) {
  //   this.samples.push(sample);
  //   sample.id = this.samples.length - 1;

  //   var that = this;
  //   sample.load(function(err) {
  //     if (err) {
  //       console.error("Error loading sample: " + sample.url + " : " + err);
  //       return;
  //     }

  //     var source = that.audioContext.createBufferSource();
  //     var output = that.nodes.trackInput;
  //     source.connect([sample.track]);
      
  //     source.buffer = buffers[samples[i].id].buffer;
      
  //     //push source node and the scheduled start time of the sample
  //     activeSources.push({sourceNode: source, sourceStartBar: beatNumber});
  //     source.start(noteTime);

  //   });
  // };


  // export
  audio.Mixer = AudioMixer;

})();