var ac = new (window.AudioContext || window.webkitAudioContext);
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

function load (src, id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', src, true);
  xhr.responseType = 'arraybuffer';
  xhr.addEventListener('load', function (e) {
    ac.decodeAudioData(e.target.response, function (buffer) {
      buffers[id] = {buffer: buffer};
    }, Error);
  }, false);
  xhr.send();
};



initSched({
    bufferArray: buffers,
    audioContext: ac
});


window.onload = function init() {
    try {
      // webkit shim
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;

    } catch (e) {
      alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    });
};

  // load: function (src) {
  //       var my = this;
  //       var xhr = new XMLHttpRequest();
  //       xhr.open('GET', src, true);
  //       xhr.responseType = 'arraybuffer';

  //       xhr.addEventListener('progress', function (e) {
  //           if (e.lengthComputable) {
  //               var percentComplete = e.loaded / e.total;
  //           } else {
  //               // TODO
  //               percentComplete = 0;
  //           }
  //           my.drawer.drawLoading(percentComplete);
  //       }, false);

  //       xhr.addEventListener('load', function (e) {
  //           my.backend.loadData(
  //               e.target.response,
  //               my.drawBuffer.bind(my)
  //           );
  //       }, false);
  //       xhr.send();
  //   },
