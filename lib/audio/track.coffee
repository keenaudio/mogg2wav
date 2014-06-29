define ["dispatcher"], (Dispatcher) ->
  _f = (msg) ->
    "Track: " + msg

  class Track extends Dispatcher
    constructor: (audioContext, masterGainNode) ->
      super("Track")
      ac = @audioContext = audioContext
      trackOutputNode = ac.createGain()
      trackInputNode = ac.createGain()
      trackVolumeNode = ac.createGain()
      #trackMasterGainNode.connect masterGainNode
      trackVolumeNode.connect trackOutputNode
      trackInputNode.connect trackVolumeNode
      @nodes =
        gain: trackMasterGainNode
        volume: trackVolumeNode
        input: trackInputNode

      @clips = []

      @solo = false
      @mute = false
      @numChannels = 2

      return
    addClip: (clip, index) ->
      console.log "Adding clip " + clip + " at index " + index
      @clips[index] = clip
      return

    getClip: (index) ->
      clip = @clips[index]
      #console.log "Getting clip at index " + index + " : " + clip
      return clip

    soloToggle: () ->
      console.log _f "soloToggle, was: " + @solo
      prev = @solo
      @solo = not @solo
      @notifyChange "solo", @solo, prev
      return

    muteToggle: () ->
      console.log _f "muteToggle, was: " + @mute
      prev = @mute
      @mute = not @mute
      # node = @nodes.gain
      # node.gain.value = if @mute then 0 else 1
      # console.log _f "muteToggle, now: " + @mute + " gain: " + node.gain.value
      @notifyChange "mute", @mute, prev
      return

    setNumChannels: (numChannels) ->
      prev = @numChannels
      @numChannels = numChannels
      console.log _f("Changing numChannels %i => %i"), prev, @numChannels
      @notifyChange "numChannels", @numChannels, prev

  # export
  return Track
