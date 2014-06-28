define ['audio/loadable', 'merge'], (Loadable, merge) ->
  class Sample extends Loadable
    constructor: (audioContext, props) ->
      super()
      @audioContext = audioContext
      merge this, props
      return

  Sample::load = loadAudioSample = (cb) ->
    if @buffer
      cb()
      return

    that = this
    @loadBuffer @url, (buffer)->
      that.audioContext.decodeAudioData buffer, ((buffer) ->
        that.setBuffer buffer
        cb()  if cb
        return
      ), cb
      return

    # xhr = new XMLHttpRequest()
    # xhr.open "GET", @url, true
    # xhr.responseType = "arraybuffer"
    # that = this
    # xhr.addEventListener "load", ((e) ->
    #   that.audioContext.decodeAudioData e.target.response, ((buffer) ->
    #     that.setBuffer buffer
    #     cb()  if cb
    #     return
    #   ), cb
    #   return
    # ), false
    # xhr.send()
    return

  Sample::setBuffer = (buffer) ->
    @buffer = buffer
    return

  
  # export
  return Sample
