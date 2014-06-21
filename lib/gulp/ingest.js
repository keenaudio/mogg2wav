module.exports = function($) {
  var path = $.path;
  return function() {
    return $.through2.obj(function (file, enc, cb) {
      var ext = path.extname(file.path);
      var folder = path.basename(file.path, ext);
      var filename = folder + ext;
      var targetPath = $.util.template($.config.get("ingest.output"), {
        file: file,
        folder: folder,
        filename: filename
      });
      $.util.log("Ingesting: " + file.path + " to " + targetPath);
      $.exec([
          'cp "' + file.path + '" "' + targetPath + '"'
      ], {}, cb);
    });
  }; 
}