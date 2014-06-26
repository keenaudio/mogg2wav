audio = undefined # global exports
do ->
  ac = new (window.AudioContext or window.webkitAudioContext)
  audio =
    context: ->
      ac

    createMixer: ->
      new audio.Mixer(ac)

    createSample: (props) ->
      new audio.Sample(ac, props)
