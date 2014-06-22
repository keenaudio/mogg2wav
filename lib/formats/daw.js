var _, assert; //globals

if (typeof exports !== 'undefined') {
  _ = require('underscore');
  assert = require('assert');
}

var DawProject = function(data) {
  if (data === 'undefined') { // default project settings
    data = {
      projectInfo: {
        tempo: 120,
        tracks: 0,
        effects: []
      },
      samples: []
    };
  }

  assert(data.projectInfo && typeof data.projectInfo === 'object');
  this.projectInfo = data.projectInfo;

  assert(data.samples && data.samples instanceof Array);
  this.samples = data.samples;
};

DawProject.prototype.addTrack = function() {
  var info = this.projectInfo;
  info.tracks++;
  info.effects.push([]);
  return info.tracks;
}

DawProject.prototype.addSample = function(url, duration, trackNum, startTime) {
  assert(url, 'url is required');
  assert(duration, 'duration is required');
  assert(trackNum, 'trackNum is required');
  startTime = startTime || [0];
  assert(startTime instanceof Array, 'startTime should be an array');

  var samples = this.samples;
  var newId = samples.length + 1;
  samples.push({
    id: newId,
    url: url,
    track: tracknum,
    startTime: startTime,
    duration: duration
  });
  return newId;
}

if (typeof exports !== 'undefined') {
  return {
    fromJSON: function(json) {
      return new DawProject(json);
    }
  };
}