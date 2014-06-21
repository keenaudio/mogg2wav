module.exports = function($) {
  var path = $.path;
  var fs = $.fs;


  return function explode() {
    return $.through2.obj(function (file, enc, next) {

      var ext = path.extname(file.path);
      var folder = path.basename(file.path, ext);
      var filename = folder + ext;

      var metaPath = $.util.template($.config.get("meta.output"), {
        file: file,
        folder: folder,
        filename: filename
      });

      var metaStr = fs.readFileSync(metaPath);
      $.util.log("meta: " + metaStr);
      var meta = JSON.parse(metaStr);

      var numChannels = meta["numChannels"];
      $.util.log("Exploding " + file.path + " with " + numChannels + " channels");


      function createTargetFolder(cb) {
        var targetDir = path.resolve(path.dirname($.util.template($.config.get("explode.output"), {
          file: file,
          folder: folder,
          filename: filename,
          tracknum: 1,
          $: $
        })), '..');

        $.util.log("Creating folder " + folder + " in targetDir " + targetDir);

        $.exec([
          'mkdir -p "' + folder + '"'
        ], {
          cwd: targetDir
        }, cb);
      };

      var curChannel = 0;

      function createWav(tracknum, cb) {;

        var targetFile = $.util.template($.config.get("explode.output"), {
          file: file,
          folder: folder,
          filename: filename,
          tracknum: tracknum,
          $: $
        });

        $.exec([
          'sox -V0 -S "' + file.path + '" "' + targetFile + '" remix ' + tracknum
        ], {}, cb);

      };


      function nextWav() {
        curChannel++;
        if (curChannel > numChannels) {
         $.util.log("ALL DONE");
          next();
        } else {
          createWav(curChannel, nextWav);
        }
      }

      createTargetFolder(nextWav);

    });

  };
}