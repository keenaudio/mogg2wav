define () ->
  _f = (msg) ->
    "Track: " + msg

  class Track
    constructor: (audioContext, masterGainNode) ->
      ac = @audioContext = audioContext
      trackMasterGainNode = ac.createGain()
      trackInputNode = ac.createGain()
      trackVolumeNode = ac.createGain()
      trackMasterGainNode.connect masterGainNode
      trackVolumeNode.connect trackMasterGainNode
      trackInputNode.connect trackVolumeNode
      @nodes =
        gain: trackMasterGainNode
        volume: trackVolumeNode
        input: trackInputNode

      @clips = []

      @solo = false
      @mute = false

      return
    addClip: (clip, index) ->
      console.log "Adding clip " + clip + " at index " + index
      @clips[index] = clip
      return

    getClip: (index) ->
      clip = @clips[index]
      #console.log "Getting clip at index " + index + " : " + clip
      return clip

    soloToggle: (event) ->
      console.log _f "soloToggle"
      @solo = !@solo
      return

    muteToggle: (event) ->
      console.log _f "muteToggle"
      @mute = !@mute
      node = @nodes.gain
      node.gain.value = @mute ? 0 : 1 
      return

  # export
  return Track
