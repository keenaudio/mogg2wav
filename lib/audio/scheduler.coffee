audio = undefined # global import
do ->
  AudioScheduler = (audioContext) ->
    @audioContext = audioContext
    
    #this.mixer = mixer;
    @items = []
    @activeSources = []
    @samplesToLoad = 0
    return

  AudioScheduler::clearAll = ->
    @stopAll()
    @activeSources = []
    return

  AudioScheduler::addItem = (sample, track, startTime) ->
    assert sample and track #@strip
    item =
      sample: sample
      track: track
      startTime: startTime
      loaded: false
      source: `undefined`

    @items.push item
    item.id = @items.length - 1
    item

  AudioScheduler::play = ->
    if @samplesToLoad
      console.log "AudioScheduler: cannot play beause waiting for samples"
      return
    currentTime = @audioContext.currentTime
    console.log "AudioScheduler: play(): " + currentTime
    @samplesToLoad = 0
    that = this
    @items.forEach (item) ->
      if item.startTime <= currentTime and item.loaded is false
        that.samplesToLoad++
        sample = item.sample
        track = item.track
        assert sample and track #@strip
        sample.load (err) ->
          that.samplesToLoad--
          item.loaded = true
          if err
            console.error "Error loading sample: " + sample.url + " : " + err
          else
            source = that.audioContext.createBufferSource()
            dest = track.nodes.input
            source.connect dest
            source.buffer = sample.buffer
            
            #push source node and the scheduled start time of the sample
            that.activeSources.push
              source: source
              startTime: item.startTime
              item: item

          
          # source.start(startTime);
          that.play()  if that.samplesToLoad is 0
          return

      return

    if @samplesToLoad
      console.log "AudioScheduler: returning from play waiting for samples"
      return
    console.log "AudioScheduler: playing all activeSources at currentTime"
    currentTime = @audioContext.currentTime
    @activeSources.forEach (element, index) ->
      
      #var percent = (current16thNote-element.sourceStartBar) / (element.sourceNode.buffer.duration/(secondsPerBeat*0.25));
      #element.sourceNode.start(element.sourceNode.buffer.duration * percent);
      element.source.start currentTime
      return

    return

  AudioScheduler::stopAll = ->
    @activeSources.forEach (element) ->
      element.source.stop 0
      return

    return

  
  # export
  audio.Scheduler = AudioScheduler
  return
