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
  assert: require('assert'),
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

// hasChanged callback handler for gulp-changed
// Build if source is newer or if target does not exist
$.needBuild = function(stream, cb, sourceFile, targetPath) {

  fs.stat(targetPath, function (err, targetStat) {
      if (err && err.code === 'ENOENT') {
        $.util.log("Processing NEW source: " + sourceFile.relative);
        stream.push(sourceFile);
      } else if (sourceFile.stat.mtime > targetStat.mtime) {
        $.util.log("Processing NEWER source: " + sourceFile.relative);
        stream.push(sourceFile);
      } else {
        //$.util.log("NO change needed: " + sourceFile.relative);
      }
      cb();
  });

}

// More advanced helpers
var myHelpers = require('./gulp')($);
$.merge($,  myHelpers); // Load gulp helpers

// Config
var Config = require('./lib/common/config');
$.config = new Config();
require('./config')($.config);

gulp.task('test3', function() {

  var jsonFilter = $.filter('**/*.json');
  var xmlFilter = $.filter('**/*.xml');

  function outputPath(baseName, ext) {
    return './' + baseName + '/json/' + baseName + ext;
  }

  return gulp.src([
    '**/*.als.json'
    ], { cwd: $.config.get('paths.als') })
    .pipe($.through(function(file) {
      var stream = this;
      $.util.log("Ra Exploding ALS JSON file: " + file.path);
      var json = JSON.parse(file.contents);
      var alsProject = require('./lib/formats/als').fromJSON(json);
      var liveSet = alsProject.liveSet;
      var tracks = liveSet.tracks;
      var baseName = path.basename(file.path, '.als.json');

      _.each(tracks, function(track, index) {

        var trackFile = new $.util.File();
        trackFile.contents = new Buffer(JSON.stringify(track.data, null, 2));
        trackFile.path = outputPath(baseName, ".track" + $.pad(index, 2) + ".json");
        stream.queue(trackFile);

        //track.setName( "haxor" + index);
      });

      var scenes = liveSet.scenes;
      _.each(scenes, function(scene, sceneIndex) {
        var sceneFile = new $.util.File();
        sceneFile.contents = new Buffer(JSON.stringify(scene.data, null, 2));
        sceneFile.path = outputPath(baseName, ".scene" + $.pad(sceneIndex, 2) + ".json");
        stream.queue(sceneFile);

        _.each(tracks, function(track, trackIndex) {
          var clip = track.getClip(sceneIndex);
          if (clip) {
            //clip.setName('Clip.' + sceneIndex + '.' + trackIndex);
            var clipFile = new $.util.File();
            clipFile.contents = new Buffer(JSON.stringify(clip.data, null, 2));
            clipFile.path = outputPath(baseName, ".clip-s" + $.pad(sceneIndex, 2) + "-t" + $.pad(trackIndex, 2) + ".json");
            stream.queue(clipFile);
          }
        });
      });
      var data = JSON.stringify(alsProject.data, null, 2);
      file.contents = new Buffer(data);
      this.queue(file);
      $.util.log("End explosion");
    })) 
   // .pipe(jsonFilter.restore())
    .pipe($.through(function(file) {
      $.util.log("Here: " + path.extname(file.path));
      if (path.extname(file.path) === '.json') {
        var xmlFile = file.clone();
        xmlFile.path = xmlFile.path.replace(/json/g, 'xml');
        //xmlFile.base = xmlFile.base.replace('json', 'xml');
        $.util.log("Adding XML file: " + xmlFile.path + ", " + xmlFile.base);
        this.queue(xmlFile);
      }
      $.util.log("Just passing through: " + file.path);

      this.queue(file);
    }))
    .pipe(xmlFilter)
    .pipe($.json2xml())
    .pipe(xmlFilter.restore())
    .pipe(gulp.dest($.config.get('paths.outbox')));
    

});


gulp.task('test2', function(cb) {

  var alsProject;
  var wavFilter = $.filter('**/*.wav');
  var alsFilter = $.filter('**/*.als');


  gulp.src($.config.get('paths.templates') + '/Untitled.als.json')
    .pipe($.through(function(file) {
      var json = JSON.parse(file.contents);
      alsProject = require('./lib/formats/als').fromJSON(json);
      $.util.log("Parsed ALS file");
    }))
    .on('end', function() {
      $.util.log("reading wavs");
      gulp.src($.config.get('paths.folders') + '/**/*.wav', { read: false })
        .pipe($.debug({ verbose: true }))

        .pipe($.through2.obj(function(file, enc, next) {
          $.util.log("Getting duration for: " + file.path);
          $.sox.duration(file.path, function(duration) {
            $.util.log("duration is " + duration);
            var fileProps = $.fileProps(file);
            var liveSet = alsProject.liveSet;
            var track = liveSet.addTrack(fileProps.folder);
            $.util.log("Calling next");
            next();
          });
        }))
        .on('data', function() {
          $.util.log("Got data");
        })
        .on('end', function() {
          $.util.log("Writing new ALS file out")
          var file = new $.util.File();
          var data = JSON.stringify(alsProject.data, null, 2);
          file.contents = new Buffer(data);
          //file.base = $.config.get('paths.folders');
          file.path = $.config.get('paths.outbox') + '/test2.als'
      
          var stream = $.through()
            .pipe(gulp.dest($.config.get('paths.outbox')))
            .on('data', function() {
              $.util.log('data is pullling');
              cb();
            })
            .on('end', function() {
              $.util.log("thats all folks")
              //cb();
            });

          stream.write(file);



        })


    });
});

gulp.task('test1', function() {

  var jsonFilter = $.filter('**/*.als.json');

  return gulp.src([
    '**/*',
    '!**/*.als'
    ], { cwd: $.config.get('paths.als') })
    .pipe(jsonFilter)
    .pipe($.through(function(file) {
      $.util.log("Exporting ALS file: " + file.path);
      var json = JSON.parse(file.contents);
      var alsProject = require('./lib/formats/als').fromJSON(json);
      var liveSet = alsProject.liveSet;
      var tracks = liveSet.tracks;
      _.each(tracks, function(track, index) {
        track.setName( "haxor" + index);
      });

      var scenes = liveSet.scenes;
      _.each(scenes, function(scene, sceneIndex) {
        _.each(tracks, function(track, trackIndex) {
          var clip = track.getClip(sceneIndex);
          if (clip) {
            clip.setName('Clip.' + sceneIndex + '.' + trackIndex);
          }
        });
      });
      var data = JSON.stringify(alsProject.data, null, 2);
      file.contents = new Buffer(data);
      this.queue(file);
    }))
    .pipe($.json2xml())
   // .pipe($.debug({ verbose: true }))
    .pipe($.tRename('<%= folder %>/<%= folder %>.als', {
      extension: '.als.json'
    }))
   //.pipe($.debug({ verbose: true }))
    .pipe($.gzip({ append: false }))
    .pipe(jsonFilter.restore())
    .pipe(gulp.dest($.config.get('paths.outbox')));

});

gulp.task('library', function(cb) {
  $.sequence(
    'ingest',
    'als2json',
 //   'als2daw',
    'oggdec',
     'meta',
    'explode',
    cb);

});

// Tasks
gulp.task('default', ['prepare'], function(cb) {
  //$.util.log("mogg2wav, running with config: " + JSON.stringify($.config, null, 2));
  $.sequence(
    'library',
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
    .pipe($.explode());
});

gulp.task('als2json', function() {
  return gulp.src($.config.get("als2json.input"), { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("als2json.output"))) // only process new/changed files
    .pipe($.als2json($.config.getRaw("als2json.output")));
});

gulp.task('als2daw', function() {
  return gulp.src($.config.get("als2daw.input"), { buffer: false })
    .pipe($.args.force ? $.through() : $.hasChanged($.config.getRaw("als2daw.output"))) // only process new/changed files
    .pipe($.als2daw($.config.getRaw("als2daw.output")));
});

//gulp.task('publish', $.shell.task([
//  'cp -R ' + $.config.publish.input + '/ ' + $.config.publish.output + '/'
//]));

gulp.task("app-templates", function() {

  var jadeVars = {
    "NG": true,
    config: $.config,
    baseUrl: $.config.get('routes.app')
  };

  return gulp.src("{views,components}/**/*.jade", { cwd: "web/app"})
   // .pipe(jadeFilter)
   // .pipe($.jsmacro($.options.jsmacro.client)) // unlike html, jade will be processed with jsmacro
   .pipe($.debug({ verbose: true }))

    .pipe($.jade({ pretty: true, locals: jadeVars }))
    .pipe($.debug({ verbose: true }))
    //.pipe(jadeFilter.restore())
    .pipe($.ngHtml2js({
        moduleName: "app-templates",
       // declareModule: false,
        rename: function(filename) {
           return filename.replace('.html', '.jade');
        }
      //  stripPrefix: config.cwd
    }))
    .pipe($.concatUtil('app-templates.js'))
    .pipe($.rename({
      dirname: "web/app/scripts",
      basename: "app-templates"
    }))
    .pipe($.debug({ verbose: true }))

   // .pipe($.concat(config.module + '.js'))
    .pipe(gulp.dest(".tmp"))
    .pipe($.size({ showFiles: true }));

});

gulp.task('coffee', function() {

  return gulp.src('{lib,server,web}/**/*.coffee')
    .pipe($.changed('.tmp', { 
      extension: ".js",
      hasChanged: $.needBuild
    }))
    .pipe($.sourcemaps.init())
      .pipe($.coffee({ bare: true }).on('error', $.util.log))
    .pipe($.sourcemaps.write({ sourceRoot: './' }))
    .pipe(gulp.dest('.tmp'));

});

gulp.task('less', function() {

  return gulp.src('web/**/*.less')
    .pipe($.changed('.tmp', { 
      extension: ".css",
      hasChanged: $.needBuild
    }))
    .pipe($.debug({ verbose: true }))
    .pipe($.sourcemaps.init())
      .pipe($.less({
        paths: path.join(__dirname, 'web/app/styles'),
        sourceMapBasepath: path.join(__dirname, 'web')
      }).on('error', $.util.log))
    .pipe($.sourcemaps.write({ sourceRoot: '/' }))
    .pipe(gulp.dest('.tmp/web'));

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

  gulp.watch('{lib,server,web}/**/*.coffee', { mode: 'poll'}, ['coffee']);
  gulp.watch("web/app/**/*.jade", { mode: 'poll'}, ["app-templates"]); // recompile jade templates to JS on file save
  gulp.watch('web/**/*.less', { mode: 'poll'}, ['less']);

  var lr = livereload();
  gulp.watch([
      "{web,.tmp,lib,static}/**/*",
      "!**/*.{jade,coffee,less}"
    ], { 
      // glob: , 
      // emitOnGlob: false, 
      // emit: "all",
     // mode: 'poll'
    }, function(event) {
      $.util.log('WATCH CHANGE: ' + event.type + ' ' + event.path);
      lr.changed(event.path);
    });

    //.pipe(lr);
});

gulp.task('build', function(cb) {
  runSequence('clean', cb);
});

gulp.task('server', ['clean'], function(cb) {
  // start LR server
  livereload();
  $.sequence('app-templates', 'coffee', 'less', function() {
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
    //args.push("--config-file=../src/config.json");
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
   // DEBUG: "tinylr:*,send"
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
      'server/**/*'
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






