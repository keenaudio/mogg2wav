module.exports = function($) {
  var path = $.path;
  return function oggdec() {
    return $.through2.obj(function (file, enc, cb) {
      var ext = path.extname(file.path);
      var folder = path.basename(file.path, ext);
      var filename = folder + ext;
      var targetPath = $.util.template($.config.get("oggdec.output"), {
        file: file,
        folder: folder,
        filename: filename
      });
      $.util.log("Decoding: " + file.path + " to " + targetPath);
      $.exec([
        'sox -S -t ogg "' + file.path + '" "' + targetPath + '"'
      ], {}, cb);
    });
  }
}
