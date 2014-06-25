var Project; // global exports

var _, assert; //global imports

if (typeof exports !== 'undefined') {
  _ = require('underscore');
  assert = require('assert');
}

(function() {
  'use strict';

  Project = function(name, type) {
    this.name = name;
    this.type = type;
    this.sets = [];
    this.tracks = [];
  };

  Project.prototype.addSet = function(set) {
    this.sets.push(set);
    set.id = this.sets.length - 1;
  }


  Project.prototype.addTrack = function(track) {
    this.tracks.push(track);
    track.id = this.tracks.length - 1;
  }

  var Set = function(name, type) {
    this.name = name;
    this.type = type;

    this.samples = {};
  }

  Set.prototype.addSample = function(sample, track) {
    this.samples[track.id] = sample;
  }


  Set.prototype.getSample = function(track) {
    return this.samples[track.id];
  }

  var Track = function(name, type) {
    this.name = name;
    this.type = type;
  }

  Project.Set = Set;
  Project.Track = Track;

})();

if (typeof exports !== 'undefined') {
  module.exports = Project;
}