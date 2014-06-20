module.exports = function($) {
  var path = $.path;
  var fs = $.fs;
  return function hasChanged(outputTemplate, templateVars) {
    return $.through2.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        var fullPath = file.path;
        var ext = path.extname(fullPath);
        var folder = path.basename(fullPath, ext);
        var filename = folder + ext;

        var sourceFile = file;
        var targetPath = $.util.template(outputTemplate, $.merge(templateVars || {}, {
            file: file,
            folder: folder,
            filename: filename,
            $: $
        }));

        $.util.log("Inspecting target path: " + targetPath);
        var stream = this;
        fs.stat(targetPath, function (err, targetStat) {
            if (err && err.code === 'ENOENT') {
              $.util.log("Processing NEW track: " + folder);
              stream.push(sourceFile);
            } else if (sourceFile.stat.mtime > targetStat.mtime) {
              $.util.log("Processing NEWER track: " + folder);
              stream.push(sourceFile);
            } else {
              $.util.log("NOT changed: " + filename);
            }
            cb();
        });
    });

}
}