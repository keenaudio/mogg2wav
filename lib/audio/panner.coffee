define () ->
  class Panner
    constructor: (inputNode) ->
      ac = inputNode.context
      splitter = ac.createChannelSplitter()
      inputNode.connect splitter

      left = ac.createGain()
      splitter.connect left, 0, 0

      right = ac.createGain()
      splitter.connect right, 1, 0

      merger = ac.createChannelMerger()
      left.connect merger, 0, 0
      right.connect merger, 0, 1

      @nodes =
        input: inputNode
        splitter: splitter
        left: left
        right: right
        output: merger
      return
      

