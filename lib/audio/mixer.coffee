define [
  "audio/track"
], (Track) ->
  _f = (msg) ->
    "Mixer: " + msg

  class AudioMixer
    constructor: (@audioContext) ->
      @tracks = []
      @samples = []
      @activeSources = []
      @buffers = []
      masterGainNode = audioContext.createGain()
      masterGainNode.gain.value = .8
      masterGainNode.connect audioContext.destination
      @nodes =
        masterGain: masterGainNode
        trackGain: []
        trackVolume: []
        trackInput: []

      return

  AudioMixer::createTrack = ->
    track = new Track(@audioContext, @nodes.masterGain)
    track.addHandler "change", (prop, val, last) ->
      console.log _f("Track %i change: %s : %s => %s"), track.id, prop, last, val
      if prop is "mute"
        node = track.nodes.gain
        node.gain.value = if val then 0 else 1
        console.log _f("Track %i mute: %s, gain %i"), track.id, track.mute, node.gain.value
    nodes = @nodes
    nodes.trackGain.push
      node: track.nodes.gain
      isMuted: false
      isSolo: false

    nodes.trackVolume.push track.nodes.volume
    nodes.trackInput.push track.nodes.input
    @tracks.push track
    track.id = @tracks.length - 1
    track

  AudioMixer::getTrack = (id) ->
    @tracks[id]

  
  # export
  return AudioMixer