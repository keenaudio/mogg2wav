'use strict';

var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var args = require('yargs').argv;// Command line args

// Core helpers
var $ = require('gulp-load-plugins')(); // Load gulp plugins (lazy)
$.merge = require('merge');
$.merge($, {
  gulp: gulp,
  args: args,
  path: path,
  through: require('through'),
  through2: require('through2'),
  fs: fs,
  sequence: require('run-sequence')
});

// Simple helper methods
$.pad = function(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

$.mkdirs = function(dirs) {
  var cmds = [];
  for (var i = 0; i < dirs.length; i++) {
    cmds.push('mkdir -p "' + dirs[i] + '"');
  }
  return $.shell.task(cmds);
}

// More advanced helpers
var myHelpers = require('./lib/gulp')($);
$.merge($,  myHelpers); // Load gulp helpers

// Config
var Config = require('./lib/common/config').Config;
$.config = new Config();
require('./config')($.config);


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

gulp.task('mkdirs', $.mkdirs($.config.get("create_dirs")));

gulp.task('initconfig', function() {
  var configPath = config.get("paths.configJSON");
  var defaultPath = config.get("paths.configJSON.default");
  if (!fs.existsSync(configPath)) {
    $.util.log("Creating new config file: " + configPath);
    return gulp.src(defaultPath)
      .pipe(gulp.dest(configPath));
  }
});

gulp.task('prepare',function(cb) {
  $.sequence('clean', 'mkdirs', 'initconfig', cb);
});

// Ingest
gulp.task('ingest', function() {
  return gulp.src($.config.ingest.input, { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.get("ingest.output"))) // only process new/changed files
    .pipe($.ingest())
//    .pipe(gulp.dest($.config.ingest.output))
});


// OGG Decode
gulp.task('oggdec', function() {
  return gulp.src($.config.oggdec.input, { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.get("oggdec.output"))) // only process new/changed files
    .pipe($.oggdec())
});

// Extract meta
gulp.task('meta', function() {
  return gulp.src($.config.meta.input, { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.get("meta.output"))) // only process new/changed files
    .pipe($.meta())
});

// Explode one multichannel to many mono files
gulp.task('explode', function() {
  return gulp.src($.config.explode.input, { buffer: false })
    //.pipe($.debug({ verbose: true }))
    .pipe($.args.force ? $.through() : $.hasChanged($.config.get("explode.output"), { tracknum: 1 })) // only process new/changed files
    .pipe($.explode())
});

//gulp.task('publish', $.shell.task([
//  'cp -R ' + $.config.publish.input + '/ ' + $.config.publish.output + '/'
//]));

gulp.task("app-templates", function() {

  var jadeVars = {
    "NG": true
  };

  return gulp.src("**/*.jade", { cwd: "web/app"})
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
      dirname: "web/app",
      basename: "app-templates"
    }))
    .pipe($.debug({ verbose: true }))

   // .pipe($.concat(config.module + '.js'))
    .pipe(gulp.dest(".tmp"))
    .pipe($.size({ showFiles: true }));

});


var lrServer;
function livereload() {
  if (!lrServer) {
    var lrPort = $.config.get("ports.livereload");
    $.util.log("Starting livereload server on port: " + lrPort);
    lrServer = $.livereload(lrPort);
  }
  return lrServer;
}


gulp.task('watch', function() {

  gulp.watch("web/app/**/*.jade", ["app-templates"]); // recompile jade templates to JS on file save


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

gulp.task('dev-server', function(cb) {
  var lr = livereload();
  var args = serverArgs(false);
  var file = $.path.resolve('./server.js');

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
      'config.json',
      'lib/server/**/*'
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






