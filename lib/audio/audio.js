var audio; // global exports

(function() {
  'use strict';

  var ac = new (window.AudioContext || window.webkitAudioContext);

  audio = {
    context: function() { return ac; },
    createMixer: function() {
      return new audio.Mixer(ac);
    },
    createSample: function(props) {
      return new audio.Sample(ac, props);
    }
  }

})();