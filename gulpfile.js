'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var path = require('path');
var through = require('through');
var through2 = require('through2');
var fs = require('fs');
var cp = require("child_process");
var Stream = require('stream').Stream;
var Writable = require('stream').Writable;

var $ = require('gulp-load-plugins')(); // Load gulp plugins (lazy)
$.sequence = require('run-sequence');
$.merge = require('merge');

// Command line args
$.args = args;

// Config
$.config = require("./config.json");

// Internals
var serverArgs = function(dist) {
  // Build command line args for express server
  var args = [];
  args.push("--port=8008");
  if ($.args['server-url']) {
    args.push("--server-url=" + $.args['server-url']);
  }

  if (dist) {
    args.push("--config-file=../src/config.json");
  }
  return args;
};

var lrServer;
function livereload() {
  if (!lrServer) {
    $.util.log("Server pages: starting livereload server on port: " + $.config.livereload);
    lrServer = $.livereload($.config.livereload);
  }
  return lrServer;
}

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
  });
  return stream;
}

$.shellOutput = function(cmd, args, cb) {
  // spawn program
  var program = cp.spawn(cmd, args);

  // create buffer
  var newBuffer = new Buffer(0);

  // when program receives data add it to buffer
  program.stdout.on("readable", function () {
    var chunk;
    while (chunk = program.stdout.read()) {
      newBuffer = Buffer.concat([
        newBuffer,
        chunk
      ], newBuffer.length + chunk.length);
    }
  });

  // when program finishes call callback
  program.stdout.on("end", function () {
    cb(newBuffer);
  });
}

$.mkdirs = function(dirs) {
  var cmds = [];
  for (var i = 0; i < dirs.length; i++) {
    cmds.push('mkdir -p "' + dirs[i] + '"');
  }
  return $.shell.task(cmds);
}

$.hasChanged = function(outputTemplate, templateVars) {
    return through2.obj(function (file, enc, cb) {
        if (file.isNull()) {
            gutil.log("CHANGED: NULL FILE");
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
            filename: filename
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


$.oggdec = function() {

  return through2.obj(function (file, enc, cb) {
    var ext = path.extname(file.path);
    var folder = path.basename(file.path, ext);
    var filename = folder + ext;
    var targetPath = $.util.template($.config.oggdec.output, {
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

$.meta = function() {

  return through2.obj(function (file, enc, cb) {
    var ext = path.extname(file.path);
    var folder = path.basename(file.path, ext);
    var filename = folder + ext;
    var targetPath = $.util.template($.config.meta.output, {
      file: file,
      folder: folder,
      filename: filename
    });
    $.util.log("Extracting meta from: " + file.path + " to " + targetPath);
    $.shellOutput("soxi",  ["-c",file.path], function(buffer) {
      var numChannels = parseInt(buffer.toString());
      $.util.log("File has " + numChannels + " channels");
      var meta = {
        "name": folder,
        "numChannels": numChannels,
        "metaVersion": 1,
        "processTime": new Date().getTime()
      };

      var s = through();
      s.pipe($.debug({ verbose: true })).pipe(gulp.dest(process.cwd()));

      var file = new $.util.File();
      file.contents = new Buffer(JSON.stringify(meta, null, 2));
      file.path = targetPath;
      s.write(file);
    });

  });
}


$.explode = function() {

  return through2.obj(function (file, enc, next) {

    var ext = path.extname(file.path);
    var folder = path.basename(file.path, ext);
    var filename = folder + ext;

    var metaPath = $.util.template($.config.meta.output, {
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
      var targetDir = path.resolve(path.dirname($.util.template($.config.explode.output, {
        file: file,
        folder: folder,
        filename: filename,
        tracknum: 1
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

      var targetFile = $.util.template($.config.explode.output, {
        file: file,
        folder: folder,
        filename: filename,
        tracknum: tracknum
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
}

$.ingest = function() {
  return through2.obj(function (file, enc, cb) {
    var ext = path.extname(file.path);
    var folder = path.basename(file.path, ext);
    var filename = folder + ext;
    var targetPath = $.util.template($.config.ingest.output, {
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

$.server = function(fileName, opt){
  $.util.log("Server fleName: " + fileName + " options: " + JSON.stringify(opt, null, 2)); //@strip

  var options = $.merge({
    cwd: process.cwd(),
    nodeArgs: [],
    args: [],
    env: process.env || {},
    cmd: process.argv[0]
  }, opt || {});

  var stream, child, timeout, running = false, ignoreChanges = false;

  function processFile(file){
    $.util.log("dev-server processFile: " + file.path + " running: " + running + " ignoreChanges: " + ignoreChanges);
    if (ignoreChanges) return;
    startServer();
    if (!timeout) {
      $.util.log("Setting timeout to start Server");
      timeout = setTimeout(startServer, 250);
    } else {
      $.util.log("There is already a timeout pending");
    }
  }

  function startServer(){
    $.util.log("timeout END. Starting server");
    ignoreChanges = true;
    timeout = false;
    stream.emit('server.start', fileName, options.nodeArgs, options.args, options.env, options.cmd);
  }

  stream = through(processFile);
  stream.start = startServer;

  stream.on('server.start', function(filename, nodeArgs, args, env, cmd) {
    $.util.log("Received server.start event.  running: " + running + " env: " + JSON.stringify(env, null, 2));
    if (running) {
      stream.emit('server.stop');
      return;
    }
    var spawnArgs = nodeArgs.concat([filename], args);
    $.util.log("Launching server: " + cmd + " , " + JSON.stringify(spawnArgs));
    child = cp.spawn(cmd, spawnArgs, {
      env: env
    });
    running = true;
    child.on('exit', function(code, signal) {
      running = false;
      if (signal !== null) {
        $.util.log('application exited with signal ', signal);
      } else {
        $.util.log('application exited with code ', code);
      }
      if (signal === 'SIGKILL') {
        $.util.log("Received SIGKILL from child process. Restarting server");
        stream.emit('server.start', filename, nodeArgs, args, env, cmd);
      }
    });
    child.stdout.on('data', function(buffer) {
      $.util.log('[dev-server STDOUT] > ' + String(buffer));
    });
    child.stderr.on('data', function(buffer) {
      $.util.log('[dev-server STDERR] > ' + String(buffer));
    });
    stream.emit('server.started');
  });

  stream.on('server.stop', function() {
    $.util.log("Received 'server.stop' event.  running: " + running);

    if (running) {
      $.util.log("Server is running.  Stopping it now");
      child.kill('SIGKILL');
      running = false;
    }
  });
  stream.on('server.started', function() {
    $.util.log("Server has started, now watching files for changes");
    ignoreChanges = false;
  });

 return stream;
};

// Tasks

gulp.task('default', ['prepare'], function(cb) {
  //$.util.log("mogg2wav, running with config: " + JSON.stringify($.config, null, 2));

  $.sequence(
    'ingest',
    'oggdec',
     'meta',
    'explode',
   // 'publish',
    cb);
});

gulp.task('clean', function() {
  return gulp.src(".tmp", {read: false}).pipe($.clean());
});

gulp.task('mkdirs', $.mkdirs($.config.createdirs));

gulp.task('prepare',function(cb) {
  $.sequence('clean', 'mkdirs', cb);
});

// Ingest
gulp.task('ingest', function() {
  return gulp.src($.config.ingest.input, { buffer: false })
    .pipe($.args.force ? through() : $.hasChanged($.config.ingest.output)) // only process new/changed files
    .pipe($.ingest())
//    .pipe(gulp.dest($.config.ingest.output))
});


// OGG Decode
gulp.task('oggdec', function() {
  return gulp.src($.config.oggdec.input, { buffer: false })
    .pipe($.args.force ? through() : $.hasChanged($.config.oggdec.output)) // only process new/changed files
    .pipe($.oggdec())
});

// Extract meta
gulp.task('meta', function() {
  return gulp.src($.config.meta.input, { buffer: false })
    .pipe($.args.force ? through() : $.hasChanged($.config.meta.output)) // only process new/changed files
    .pipe($.meta())
});

// Explode one multichannel to many mono files
gulp.task('explode', function() {
  return gulp.src($.config.explode.input, { buffer: false })
    //.pipe($.debug({ verbose: true }))
    .pipe($.args.force ? through() : $.hasChanged($.config.explode.output, { tracknum: 1 })) // only process new/changed files
    .pipe($.explode())
});

//gulp.task('publish', $.shell.task([
//  'cp -R ' + $.config.publish.input + '/ ' + $.config.publish.output + '/'
//]));

gulp.task('watch', function() {

  gulp.watch("web/static/**/*.jade", ["app-templates"]);


  var lr = livereload();
  gulp.src([
    "web/**/*",
    ".tmp/web/**/*"
    ], { read: false })
    .pipe($.watch( { name: "server pages watch" }))
    .pipe(lr);
});

gulp.task('build', function(cb) {
  runSequence('clean', cb);
});

gulp.task('server', ['clean'], function(cb) {
  // start LR server
  livereload();
  $.sequence('app-templates', 'dev-server', 'watch');
});

gulp.task('server:dist', ['build'], function(cb) {
  $.sequence('dist-server');
})

gulp.task('dev-server', function(cb) {
  var lr = livereload();
  var args = serverArgs(false);
  var file = path.resolve('./server.js');

  var env = $.merge(process.env, {
    NODE_ENV: 'development',
  //  NODE_DEBUG: "livereload,express:*",
    DEBUG: "tinylr:*,send"
  });

  $.util.log("Server env: " + JSON.stringify(env, null, 2));

  var server = $.server(file, {
    args: args,
    env: env
  });

  server.on('server.started', function() {
    $.util.log("Received SERVER STARTED event.");
  });

  server.start();

  $.watch({
    glob: ['.tmp/_livereload'],
    emitOnGlob: false
  }, function(stream) {
    $.util.log("Sending LIVERELOAD event to all clients");
   // setTimeout(function() {
      //for (var i = 0; i < lrServers.length; i++) {
        lr.changed("/");
      //}
    //}, 2000);
  });

  $.watch({
    glob: [
      file,
      'config.json'
    ],
    timeout: 1000,
    emitOnGlob: false,
 //   passThrough: false
  }, function(stream) {
   // $.util.log("Server files changed, server will restart");
    //return stream;
  })
  .pipe(server);

});


gulp.task('dist-server', function(cb) {
  var args = serverArgs(true);
  var file = options.serverFile.dist;

  $.util.log("Starting dist server: " + file + " : " + JSON.stringify(args));

  gulp.src(file)
    .pipe($.server(file, {
      args: args
    }));
});

// Convert angular templates to JS
$.html2js = function(config) {
  $.assert(config.src, "'src' is required");
  $.assert(config.dest, "'dest' is required");
  $.assert(config.module, "'module' is required");
  //$.assert(config.cwd, "'cwd' is required");

  var jadeFilter = $.filter("**/*.jade");
  var srcOptions = {};
  if (config.cwd) {
    srcOptions.cwd = config.cwd;
  }

  var jadeVars = {
    "NG": true
  };

  return gulp.src(config.src, srcOptions)
    .pipe(jadeFilter)
    .pipe($.jsmacro($.options.jsmacro.client)) // unlike html, jade will be processed with jsmacro
    .pipe($.jade({ pretty: true, locals: jadeVars }))
    //.pipe($.debug({ verbose: true }))
    .pipe(jadeFilter.restore())
    .pipe($.ngHtml2js({
        moduleName: config.module//,
        // replace: function(filename) {
        //   return filename.replace('.jade', '.html');
        // }
      //  stripPrefix: config.cwd
    }))
   // .pipe($.concat(config.module + '.js'))
    .pipe(gulp.dest(config.dest))
    .pipe($.size({ showFiles: true }));
}



gulp.task("app-templates", function() {

  var jadeVars = {
    "NG": true
  };

  return gulp.src("**/*.jade", { cwd: "web/static"})
   // .pipe(jadeFilter)
   // .pipe($.jsmacro($.options.jsmacro.client)) // unlike html, jade will be processed with jsmacro
   .pipe($.debug({ verbose: true }))

    .pipe($.jade({ pretty: true, locals: jadeVars }))
    .pipe($.debug({ verbose: true }))
    //.pipe(jadeFilter.restore())
    .pipe($.ngHtml2js({
        moduleName: "app-templates",
        rename: function(filename) {
           return filename.replace('.html', '.jade');
        }
      //  stripPrefix: config.cwd
    }))
    .pipe($.rename({
      dirname: "web/static",
      basename: "app-templates"
    }))
    .pipe($.debug({ verbose: true }))

   // .pipe($.concat(config.module + '.js'))
    .pipe(gulp.dest(".tmp"))
    .pipe($.size({ showFiles: true }));

});


