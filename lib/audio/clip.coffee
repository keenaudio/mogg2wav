define ['audio/playable', 'assert'], (Playable, assert) ->
  class Clip extends Playable
    constructor: (@sample, @track) ->
      super("Clip")
      @loaded = false
      @source = false
      return
    load: (cb) ->
      @startLoading()

      that = this

      onLoad = (err) ->
        that.finishLoading()
        if err
          console.error "Error loading sample: " + that.sample.url + " : " + err
        else
          console.log "Loaded clip sample: " + that.sample.url
          track = that.track
          sample = that.sample
          ac = track.audioContext
          source = ac.createBufferSource()
          dest = track.nodes.input
          source.connect dest
          source.buffer = sample.buffer
          that.source = source
          that.loaded = true
        cb err
        return

      onProgress = (percent) ->
        that.setPercentComplete(percent)
        console.log "Loading " + (that.percentComplete * 100) + "%"
        return

      @sample.load onLoad, onProgress
      return

    onStateChange: (state, prev) ->
      super(state, prev)
      if state == 'playing'
        console.log "Starting audio source: " + @sample.url
        @source.start @playTime
      else
        console.log "Stopping audio source: " + @sample.url
        @source.stop 0
      return
      
  return Clip

