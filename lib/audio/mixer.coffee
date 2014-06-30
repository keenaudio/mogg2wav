define [
  "dispatcher"
  "audio/track"
  "audio/panner"
], (Dispatcher, Track, Panner) ->
  _f = (msg) ->
    "Mixer: " + msg

  class AudioMixer extends Dispatcher
    constructor: (@audioContext) ->
      super("AudioMixer")
      @tracks = []
      @panners = []
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

      @soloActive = false
      return
    clearSolo: ->
      track.soloToggle() for track in @tracks when track.solo
      @updateSolo()
      return

    updateSolo: () ->
      soloTracks = (track for track in @tracks when track.solo)
      console.log _f("%i tracks are marked for solo"), soloTracks.length
      prev = @soloActive
      @soloActive = soloTracks.length > 0
      @notifyChange "soloActive", @soloActive, prev if prev isnt @soloActive
      
      if @soloActive
        console.log _f("Updating tracks following solo Rules")
        for track in @tracks
          track.nodes.output.gain.value = if track.solo then 1 else 0
      else
        for track in @tracks
          console.log _f("Updating tracks following regular Rules")
          track.nodes.output.gain.value = if track.mute then 0 else 1
      return

    createTrack: () ->
      track = new Track(@audioContext, @nodes.masterGain)

      that = this
      track.addHandler "change", (prop, val, last) ->
        console.log _f("Track %i change: %s : %s => %s"), track.id, prop, last, val
        if prop is "mute"
          node = track.nodes.gain
          node.gain.value = if val then 0 else 1
          console.log _f("Track %i mute: %s, gain %i"), track.id, track.mute, node.gain.value
        else if prop is "solo"
          that.updateSolo()

      nodes = @nodes
      nodes.trackGain.push
        node: track.nodes.gain
        isMuted: false
        isSolo: false

      nodes.trackVolume.push track.nodes.volume
      nodes.trackInput.push track.nodes.input
      @tracks.push track
      track.id = @tracks.length - 1

      panner = new Panner(track.nodes.output)
      panner.nodes.output.connect @nodes.masterGain
      @panners.push(panner)
      panner.id = @panners.length - 1
      return track

    getTrack: (id) ->
      @tracks[id]

  
  # export
  return AudioMixer