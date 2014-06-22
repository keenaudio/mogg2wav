'use strict';

var _ = require('underscore');
var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var args = require('yargs').argv;// Command line args

// Core helpers
var $ = require('gulp-load-plugins')(); // Load gulp plugins (lazy)
$.merge = require('merge');
$.merge($, {
  _: _,
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
  var cmds = [], dir;
  for (var i = 0; i < dirs.length; i++) {
    dir = _.template(dirs[i], { config: $.config });
    cmds.push('mkdir -p "' + dir + '"');
    $.util.log("Creating directory: " + dir);
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
    'als2json',
    'oggdec',
     'meta',
    'explode',
    'server',
   // 'publish',
    cb);
});

gulp.task('clean', function() {
  return gulp.src(".tmp", {read: false}).pipe($.clean());
});

gulp.task('mkdirs', $.mkdirs($.config.get("create_dirs")));


gulp.task('prepare',function(cb) {
  $.sequence('clean', 'mkdirs', cb);
});

// Ingest
gulp.task('ingest', function() {
  var moggFilter = $.filter("**/*.mogg");
  var alsFilter = $.filter("**/*.als");
  return gulp.src($.config.get("ingest.input"), { buffer: false })
    .pipe(moggFilter)
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("ingest.output.mogg"))) // only process new/changed files
    .pipe($.ingest($.config.getRaw("ingest.output.mogg")))
    .pipe(moggFilter.restore())
    .pipe(alsFilter)
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("ingest.output.als"))) // only process new/changed files
    .pipe($.ingest($.config.getRaw("ingest.output.als"), { folder: true }))
    .pipe(alsFilter.restore())
    //    .pipe(gulp.dest($.config.ingest.output))
});


// OGG Decode
gulp.task('oggdec', function() {
  return gulp.src($.config.get("oggdec.input"), { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("oggdec.output"))) // only process new/changed files
    .pipe($.oggdec())
});

// Extract meta
gulp.task('meta', function() {
  return gulp.src($.config.get("meta.input"), { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("meta.output"))) // only process new/changed files
    .pipe($.meta())
});

// Explode one multichannel to many mono files
gulp.task('explode', function() {
  return gulp.src($.config.get("explode.input"), { buffer: false })
    //.pipe($.debug({ verbose: true }))
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("explode.output"), { tracknum: 1 })) // only process new/changed files
    .pipe($.explode())
});

gulp.task('als2json', function() {
  return gulp.src($.config.get("als2json.input"), { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("als2json.output"))) // only process new/changed files
    .pipe($.als2json($.config.getRaw("als2json.output")))

})

//gulp.task('publish', $.shell.task([
//  'cp -R ' + $.config.publish.input + '/ ' + $.config.publish.output + '/'
//]));

gulp.task("app-templates", function() {

  var jadeVars = {
    "NG": true,
    config: $.config
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


gulp.task('watch', function(cb) {

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
  $.sequence('app-templates', function() {
    $.util.log("Now starting server and watch");
    $.gulp.start('dev-server', 'watch', function() {
      $.util.log("Somehow it is all over?");
    })

  });
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






