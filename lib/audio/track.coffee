define ["dispatcher", "audio/panner"], (Dispatcher, Panner) ->
  _f = (msg) ->
    "Track: " + msg

  class Track extends Dispatcher
    constructor: (audioContext, masterGainNode) ->
      super("Track")
      ac = @audioContext = audioContext

      input = ac.createGain()
      volume = ac.createGain()
      #panner = ac.createPanner()
      output = ac.createGain()
      
      #panner.panningModel = "equalpower"
      #panner.setPosition(1,0,0)
      panner = new Panner(volume)

      input.connect volume
      #volume.connect panner
      panner.nodes.output.connect output

      @panner = panner
      @nodes =
        input: input
        volume: volume
        #panner: panner
        output: output

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
      input = @nodes.input
      volume = @nodes.volume
      input.channelCount = numChannels
      # input.disconnect volume
      if numChannels is 1
        console.log _f("Connecting input to volume as dual mono")
        # input.connect volume, 0, 0
        # input.connect volume, 0, 1
        @panner.setDualMono()
      else
        console.log _f("Connecting input to volume as stereo")
        #input.connect volume
        @panner.setStereo()
      @notifyChange "numChannels", @numChannels, prev
      return
    setVolume: (value) ->
      prev = @nodes.volume.gain.value;
      @volume = value
      @nodes.volume.gain.value = value;
      @notifyChange "volume", value, prev
      return

  # export
  return Track
