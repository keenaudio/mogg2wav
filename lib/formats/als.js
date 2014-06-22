var _; //globals

if (typeof exports !== 'undefined') {
  _ = require('underscore');
}

var AbletonProject; // global exports

(function() {
  'use strict';

  AbletonProject = function(data) {
    this.data = data;
    this.liveSet = new LiveSet(data.Ableton.LiveSet[0]);
  };

  AbletonProject.prototype.toDAWFormat = function(options) {
    return {
      msg: "hello, print it up"
    };
  }

  var LiveSet = function(data) {
    this.data = data;
    var tracks = [];
    var audioTracks = data.Tracks[0].AudioTrack;
    this.tracks = _.map(audioTracks, function(track, index) {
      return new AudioTrack(track, index);
    });
    var sceneNames = data.SceneNames[0].Scene;
    this.scenes = _.map(sceneNames, function(scene, index) {
      return new Scene(scene, index);
    });
  }

  var Scene = function(data, index) {
    this.data = data;
    this.index = index;
    this.name = data.$.Value;
  }

  var AudioTrack = function(data, index) {
    this.data = data;
    this.index = index;
    this.name = data.Name[0].UserName[0].$.Value;

    var slots = [];
    var rawSlots = data.DeviceChain[0].MainSequencer[0].ClipSlotList[0].ClipSlot;
    _.each(rawSlots, function(slot, index) {
      slots.push(new ClipSlot(slot, index));
    });
    this.slots = slots;
  }

  AudioTrack.prototype.getClip = function(slotIndex) {
    if (slotIndex < this.slots.length) {
      var slot = this.slots[slotIndex];
      return slot.clip;
    }
    return undefined;
  }

  var ClipSlot = function(data, index) {
    this.data = data;
    this.index = index;
    var clip = data.ClipSlot[0].Value[0];
    this.clip = clip ? new Clip(clip) : undefined;
  }

  var Clip = function(data) {
    this.data = data;
    if (data.AudioClip) {
      this.audioClip = data.AudioClip[0];
      this.sample = this.audioClip.SampleRef ? new Sample(this.audioClip.SampleRef[0]) : undefined;
    } else {
      debugger;
    }
  }

  var Sample = function(data) {
    this.data = data;
    this.fileRef = new FileRef(data.FileRef[0]);
  }

  var FileRef = function(data) {
    this.data = data;
    this.fileName = data.Name[0].$.Value;

    var relPathElems = data.RelativePath[0].RelativePathElement;
    var pathSegments = _.map(relPathElems, function(elem) {
       return elem.$.Dir;
    });
    this.fileRelPath = pathSegments.join('/');
  }


})();

if (typeof exports !== 'undefined') {
  return {
    fromJSON: function(json) {
      return new AbletonProject(json);
    }
  };
}