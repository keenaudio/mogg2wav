define ["audio/loadable"], (Loadable) ->
  _f = (msg) ->
    "Playable: " + msg

  class Playable extends Loadable
    constructor: (label) ->
      super(label)
      console.log "Playable: " + 
      @state = 'paused'
      return
    isPaused: ->
      return @state == 'paused'
    isPlaying: ->
      return @state == 'playing'
    isLoading: ->
      return @state == 'loading'
    play: (@playTime) ->
      if @state == 'loading'
        console.log _f "cannot play/pause because state=loading"
        return

      prev = @state
      @state = (if (@state is "playing") then "paused" else "playing")
      console.log _f "changing state " + prev + " => " + @state
      @onStateChange @state, prev
      return
    stop: ->
      prev = @state
      @state = "paused"
      if prev != @state
        @onStateChange @state, prev
      return
    onStateChange: (state, prev) ->
      console.log _f "onStateChange " + prev + " => " + state
      return

  