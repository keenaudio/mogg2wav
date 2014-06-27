define [
  "audio/playable"
  "audio/sample"
  "audio/track"
  "audio/mixer"
  "audio/scheduler"
], (Playable, Sample, Track, Mixer, Scheduler)->
  ac = new (window.AudioContext or window.webkitAudioContext)
  audio =
    context: ->
      ac

    createMixer: ->
      new Mixer(ac)

    createSample: (props) ->
      new Sample(ac, props)

    createScheduler: ->
      new Scheduler(ac)

    Playable: 
      Playable

  return audio
