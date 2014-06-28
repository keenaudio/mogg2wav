define () ->
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
      return
    addClip: (clip, index) ->
      console.log "Adding clip " + clip + " at index " + index
      @clips[index] = clip
      return

    getClip: (index) ->
      clip = @clips[index]
      #console.log "Getting clip at index " + index + " : " + clip
      return clip

  # export
  return Track
