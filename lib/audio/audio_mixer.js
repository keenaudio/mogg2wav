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
    var nodes = this.nodes;
    nodes.trackGain.push({node: track.nodes.gain, isMuted: false, isSolo: false});
    nodes.trackVolume.push(track.nodes.volume);
    nodes.trackInput.push(track.nodes.input);

    this.tracks.push(track);

    track.id = this.tracks.length - 1;
    return track;
  };

  AudioMixer.prototype.getTrack = function(id) {
    return this.tracks[id];
  }

  // export
  audio.Mixer = AudioMixer;

})();