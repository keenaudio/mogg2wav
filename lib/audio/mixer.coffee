define [
  "audio/track"
], (Track) ->
  AudioMixer = (audioContext) ->
    @audioContext = audioContext
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