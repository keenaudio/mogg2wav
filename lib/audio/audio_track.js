var audio; // global import

(function() {
  'use strict';


  var AudioTrack = function(audioContext, masterGainNode) {
    var ac = this.audioContext = audioContext;

    var trackMasterGainNode = ac.createGain();
    var trackInputNode = ac.createGain();
    var trackVolumeNode = ac.createGain();

    trackMasterGainNode.connect(masterGainNode);
    trackVolumeNode.connect(trackMasterGainNode);
    trackInputNode.connect(trackVolumeNode);

    this.nodes = {
      gain: trackMasterGainNode,
      volume: trackVolumeNode,
      input: trackInputNode
    };

  };

  // export
  audio.Track = AudioTrack;

})();