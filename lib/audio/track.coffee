audio = undefined # global import
do ->
  AudioTrack = (audioContext, masterGainNode) ->
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

    return

  
  # export
  audio.Track = AudioTrack
  return
