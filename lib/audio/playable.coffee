define ["audio/loadable"], (Loadable) ->

  class Playable extends Loadable
    constructor: ->
      @state = 'paused'
      return
    isPaused: ->
      return @state == 'paused'
    isPlaying: ->
      return @state == 'playing'
    play: (@playTime) ->
      prev = @state
      @state = (if (@state is "playing") then "paused" else "playing")
      @onStateChange @state, prev
      return
    stop: ->
      prev = @state
      @state = "paused"
      if prev != @state
        @onStateChange @state, prev
      return
    onStateChange: (state, prev) ->
      console.log "Playable::stateChange " + prev + " => " + state
      return

  