audio = undefined # global import
do ->
  AudioSample = (audioContext, props) ->
    @audioContext = audioContext
    @props = props
    @url = props.url
    @duration = props.duration
    return

  AudioSample::load = loadAudioSample = (cb) ->
    if @buffer
      cb()
      return
    xhr = new XMLHttpRequest()
    xhr.open "GET", @url, true
    xhr.responseType = "arraybuffer"
    that = this
    xhr.addEventListener "load", ((e) ->
      that.audioContext.decodeAudioData e.target.response, ((buffer) ->
        that.setBuffer buffer
        cb()  if cb
        return
      ), cb
      return
    ), false
    xhr.send()
    return

  AudioSample::setBuffer = (buffer) ->
    @buffer = buffer
    return

  
  # export
  audio.Sample = AudioSample
  return
