define () ->

  class Playable
    constructor: ->
      @status = ''
      @state = 'paused'
      @percent = 0
      @audio = undefined;
    isPaused: ->
      @state == 'paused'
    isPlaying: ->
      @state == 'playing'
  