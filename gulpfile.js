'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var path = require('path');
var through = require('through');
var through2 = require('through2');
var fs = require('fs');

// Load plugins (lazy)
var $ = require('gulp-load-plugins')();
$.sequence = require('run-sequence');

// Command line args
$.args = args;

// Helper methods

$.exec = function(commands, options, cb) {
  var task = $.shell.task(commands, options);
  var stream = task();
  stream.once('end', function() {
    $.util.log("shell commands done");
    cb();
  }).on('error', function(err) {
    $.util.log("ERROR: " + err)
  }).on('data', function(data) {
    $.util.log("got data: " + data);
  })
}

$.mkdirs = function(dirs) {
  var cmds = [];
  for (var i = 0; i < dirs.length; i++) {
    cmds.push('mkdir -p "' + dirs[i] + '"');
  }
  return $.shell.task(cmds);
}

$.oggdec = function(srcFile, targetFile, cb) {
 // $.util.log("Decoding MOGG to: " + targetDir);

  var fullPath = path.resolve(srcFile);
  var extName = path.extname(fullPath);
  var folderName = path.basename(fullPath, extName);
  var fileName = path.join($.config.oggdec.input, folderName) + '.ogg' // change file extension

  $.exec([
    'cp "' + srcFile + '" "' + fileName + '"',
    'sox -S "' + fileName + '" "' + targetFile + '"'
  ], {}, cb);
}

$.explode = function(srcFile, targetDir, cb) {
 // $.util.log("Exploding to " + targetDir);

  var fullPath = path.resolve(srcFile);
  var extName = path.extname(fullPath);
  var folderName = path.basename(fullPath, extName);
  var fileName = folderName + extName;

  $.exec([
    'mkdir -p "' + folderName + '"',
    path.resolve('./explode.sh') + ' "' + fullPath + '"'
  ], {
    cwd: targetDir
  }, cb);
}

$.ingest = function() {
  return through2.obj(function (file, enc, cb) {
    $.util.log("Ingesting: " + file.path);

    var fullPath = file.path;
    var extName = path.extname(fullPath);
    var folderName = path.basename(fullPath, extName);
    var fileName = folderName + extName;
    var targetDir = $.config.oggdec.output;
    var targetFile = path.join(targetDir, folderName) + '.wav';

    $.util.log("Decoding to: "  + targetFile);
    $.oggdec(file.path, targetFile, function() {
      $.util.log("Decoding complete.");
      $.explode(targetFile, $.config.explode.output, function() {
        $.util.log("Done processing " + folderName);
        $.exec([
          'mv "' + path.join($.config.explode.output, folderName) + '" "' + $.config.publish.output + '/"', // copy to library
          'rm "' + path.join($.config.oggdec.input, folderName) + '.ogg' + '"', // remove queue item
          'rm "' + targetFile + '"' // remove multichannel wav
        //  'rm "' + fullPath + '"' // remove original .mogg file
        ], {}, cb)
        //cb();
      });
    });
  });
};

// Config
$.config = require("./config.json");

// Tasks
gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('clean', function() {
  return gulp.src("tmp", {read: false}).pipe($.clean());
});

gulp.task('mkdirs', $.mkdirs([
  $.config.oggdec.input,
  $.config.oggdec.output,
  $.config.explode.output,
  $.config.inbox,
  $.config.publish.output
]));

gulp.task('prepare',function(cb) {
  $.sequence('clean', 'mkdirs', cb);
});



gulp.task('default', ['prepare'], function(cb) {
  //$.util.log("mogg2wav, running with config: " + JSON.stringify($.config, null, 2));

  $.sequence(
    'ingest',
   // 'oggdec', 
   // 'explode', 
   // 'publish', 
    cb);
});

// Ingest

// only push through files changed more recently than the destination files
function shouldIngest(stream, cb, sourceFile, targetPath) {
  //$.util.log("Inspecting: " + sourceFile.relative + " stat: " + JSON.stringify(sourceFile.stat, null, 2));

  var filename = sourceFile.relative;
  var ext = path.extname(filename);
  var folder = filename.replace(ext, "");
  var targetDir = path.resolve($.config.publish.output, folder);

 // $.util.log("Target dir: " + targetDir);

  fs.stat(targetDir, function (err, targetStat) {
    if (err && err.code === 'ENOENT') {
      $.util.log("Processing NEW track: " + folder);
      stream.push(sourceFile);
    } else if (sourceFile.stat.mtime > targetStat.mtime) {
      $.util.log("Processing NEWER track: " + folder);
      stream.push(sourceFile);
    } else {
      $.util.log("NOT ingesting: " + filename);
    }

    cb();
  });
}


gulp.task('ingest', function() {
  return gulp.src('*.mogg', { cwd: $.config.inbox, buffer: false })
    .pipe($.changed($.config.publish.output, { hasChanged: shouldIngest })) // only process new/changed files
    .pipe($.ingest())
//    .pipe(gulp.dest($.config.ingest.output))
});


// OGG Decode
gulp.task('oggdec', function() {
  return gulp.src('**/*.mogg', { cwd: $.config.oggdec.input, read: false })
    .pipe($.oggdec($.config.oggdec.output))
});

// Explode one multichannel to many mono files
gulp.task('explode', function() {
  return gulp.src('**/*.wav', { cwd: $.config.explode.input, read: false })
    .pipe($.explode($.config.explode.output))
});

gulp.task('publish', $.shell.task([
  'cp -R ' + $.config.publish.input + '/ ' + $.config.publish.output + '/'
]));



