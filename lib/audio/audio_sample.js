var audio; // global import

(function() {
  'use strict';


  var AudioSample = function(audioContext, props) {
    this.audioContext = audioContext;
    this.props = props;
    this.url = props.url;
    this.duration = props.duration;
  };

  AudioSample.prototype.load = function loadAudioSample(cb) {
    if (this.buffer) {
      cb();
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.url, true);
    xhr.responseType = 'arraybuffer';

    var that = this;
    xhr.addEventListener('load', function (e) {
      that.audioContext.decodeAudioData(e.target.response, function (buffer) {
        that.setBuffer(buffer);
        if (cb) cb();
      }, cb);
    }, false);
    xhr.send();
  };

  AudioSample.prototype.setBuffer = function(buffer) {
    this.buffer = buffer;
  }



  // export
  audio.Sample = AudioSample;

})();