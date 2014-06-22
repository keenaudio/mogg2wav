
module.exports = function($) {
  var path = $.path;
  return function tRename(template, extraVars) {
    return $.through2.obj(function (file, enc, cb) {
      var ext = path.extname(file.path);
      var folder = path.basename(file.path, ext);
      var filename = folder + ext;
      var targetPath = $.util.template(template, $.merge({
        config: $.config,
        file: file,
        folder: folder,
        filename: filename
      }, extraVars || {}));

      $.util.log("Renaming file: " + file.path + " to: " + targetPath);
      file.path = targetPath;
      this.push(file);
      cb();
    });
  }
}
