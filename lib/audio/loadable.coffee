define ["assert"], (assert) ->

  class Loadable
    constructor: ->
      @percentComplete = 0
      @loaded = false
      @loading = false
      return
    
    load: (cb) ->
      assert false, "load is pure virtual"

    loadBuffer: (url, doneCallback, progressCallback) ->
      assert !@loading, "Already loading"
      assert !@loaded, "Already loaded"
      @loading = true

      that = this
      xhr = new XMLHttpRequest()
      xhr.open "GET", url, true
      xhr.responseType = "arraybuffer"
      xhr.addEventListener "progress", ((e) ->
        if e.lengthComputable
          that.percentComplete = e.loaded / e.total
        else
          # TODO
          that.percentComplete = 0
        progressCallback that.percentComplete, e.loaded, e.total if progressCallback
        return
      
      #my.drawer.drawLoading(percentComplete);
      ), false
      xhr.addEventListener "load", ((e) ->
        that.loaded = true
        that.loading = false
        doneCallback e.target.response if doneCallback
        return
      
      # my.backend.loadData(
      #     e.target.response,
      #     my.drawBuffer.bind(my)
      # );
      ), false
      xhr.send()
      return

  return Loadable

  