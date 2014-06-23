'use strict';

//@if LOG
var _f = function(msg) { return "server.js: " + msg; };
//@end

// 3rd party modules
var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , socket = require('socket.io')

var Config = require('./lib/common/config').Config;

var env = process.env;

//@if DEV
var DEV = (env.NODE_ENV === "development");
//@end


// Configure command-line args
var yargs = require('yargs');
var argv = yargs.usage('Usage: $0 <options>\n\nSome options can be specified in the "config.json" file.  See "Readme.md" for more details.')
// --port
  .example('$0 --port 80', 'Start server on port 80')
  .demand('p')
  .alias('p', 'port')
  .describe('p', 'Set the port number')
// --service
  .example('$0 --service=web -p 81', 'Start web service on port 81')
  .alias('s', 'service')
  .describe('s', 'Run the server for specific services, comma-separated')
  .default('s', 'web,translate')
// --config-file
  .example('$0 -p 80 -f 16001 -c ./config.json', 'Pass a config file.  Multiple paths can be passed, separate with a comma.')
  .describe('c', 'Pass a config file in JSON format. Multiple paths can be passed, separate with a comma.')
  .alias('c', 'config-file')
  .default('c', null)
// --server-url
  .example('$0 -p 80 -u http://base.mysite.net', "Set the base url for generated links to http://base.mysite.net")
  .alias('u', 'server-url')
  .describe('u', "Set the base url for generated links.")
  .default('u', "")
  .check(function(argv, options) {
    console.log(_f("Checking args: " + JSON.stringify(argv))); //@strip
    if (!argv.p) {
      throw "-p is required.  See README.md."
    }
  })
  .argv;


// Load config
var config = new Config();
require('./config')(config);

// Set config based on command-line
config.set('base-url', argv.u);

//@if DEV
config.set('dev', DEV);
//@end

if (argv.c) {
  // Load custom configs
  (function() {
    var paths = argv.c.split(',');
    for (var i = 0; i < paths.length; i++) {
      var cur = paths[i];
      console.log(_f("Loading custom config JSON: " + cur)); //@strip
      var curData;
      try {
        curData = require(cur);
        console.log(_f("Merging config from '" + cur + "': " + JSON.stringify(curData, null, 2))); //@strip
        config.merge(curData);
      } catch (e) {
        console.error("Error loading custom config for '" + cur + "': " + e);
      }
    }
  })();
}

// Validate config
(function validateConfig() {
  //if (!config.get('base-url')) {
//    throw "base url is required.  Set this with the -u or --server-url command line option.  See Readme.md for usage.";
//  }
})();

// Display info from package.json
var pkgJSON = require('./package.json');
console.log("********** Running '" + pkgJSON["name"] + "' version '" + pkgJSON["version"] + "' **********"); // do not strip this line


var modules = [];
var app = express();

// Process command-line args
app.set('port', argv.port);

// Attach some objects & libs to the app instance
app.config = config;

//@if DEV
app.DEV = DEV;
app.locals.pretty = true; // beautify html
app.locals.dev = DEV;
//@end

// Set app settings
app.set('views', path.resolve('./web')); // serve views from web dir
app.enable('strict routing');

app.ensureTrailingSlash = function(path) {
  console.log(_f("ensureTrailingSlash: " + path)); //@strip

  app.use(path, function ensureTrailingSlash(req, res, next) {
    var needSlash = (req.path === '/' && req.originalUrl.charAt(req.originalUrl.length-1) !== '/');
    if (needSlash) {
      console.log(_f("Adding trailing slash to url: " + req.originalUrl)); //@strip
      res.redirect(req.originalUrl + '/');
      return;
    }
    next();
  });
}

// Return a subset of the config for clients.  Should not return any sensitive properties.
function clientSafeConfig() {
  var baseUrl = argv.u;
  var cc = {
    "base-url": baseUrl
  };
  return cc;
}

app.clientConfig = clientSafeConfig();

// Also expose config object to templates
app.locals.config = config;


//var bodyParser = require('body-parser');
//app.use(bodyParser());

// Livereload
//@if DEV
if (DEV) {
 var lrPort = config.get('ports.livereload');
 var liveReload = require('connect-livereload');
 console.log(_f("Injecting LR script into pages, port: " + lrPort)); //@strip
 app.use('/', liveReload({
   port: lrPort,
   ignore: []
 }));
}
//@end

// Handlers
var api = require('./server/api')(config);

app.use(function(req, res, next) {
  console.log(_f("START REQUEST: " + req.url));
  next();
});

app.use('/bower_components', express.static('bower_components'));


app.use(config.get('routes.folders'), express.static(config.get('paths.folders')));

app.use(config.get('routes.folders') + '/:folder', function(req, res, next) {
  var folder = req.params.folder;
  api.wavs(folder, function(err, files) {
    res.render('pages/files.jade', {
      files: files,
      folder: folder
    });
  });
});

app.use(config.get('routes.folders'), function(req, res, next) {
  api.folders(function(err, files) {
    res.render('pages/folders.jade', {
      folders: files
    });
  });
});

// app.use(config.get('routes.als') + '/:project', function(req, res, next) {

//   var folder = req.params.project;
//   var filePath = path.join(config.get("paths.als"), folder, folder) + ".als.json";
//   var jsonStr = fs.readFileSync(filePath);
//   var json = JSON.parse(jsonStr);

//   console.log(_f("ALS JSON: " + jsonStr)); //@strip
//   api.alsProjects(function(err, files) {
//     res.render('pages/als.jade', {
//       projects: files,
//       jsonStr: jsonStr,
//       json: json
//     });
//   });
// });


// app.use(config.get('routes.als'), function(req, res, next) {
//   api.alsProjects(function(err, files) {
//     res.render('pages/als.jade', {
//       projects: files
//     });
//   });
// });
app.use(config.get('routes.als'), express.static(config.get('paths.als')));
app.use(config.get('routes.daw'), express.static(config.get('paths.openDAW')));
app.use(config.get('routes.json_api'), require('./server/json_api')(config, api));
app.use(config.get('routes.app'), require('./web/app/app_route')(config));

//@if DEV
if (DEV) {
  app.use(config.get('routes.static'), express.static('.tmp/web/static', { hidden: true }));
}
//@end

app.use(config.get('routes.static'), express.static('web/static'));

//@if DEV
if (DEV) {
  app.use(config.get('routes.lib'), express.static('.tmp/lib', { hidden: true }));
}
//@end

app.use(config.get('routes.lib'), express.static('lib'));


// Last handler, 404
app.use(function(req, res, next) {
  if (req.path === '/') {
    //res.render('pages/index.jade', {});
    res.redirect(config.get('routes.app'));
    return;
  }

  console.log(_f("404 Not found: " + req.path)); //@strip
  res.send(404);
});

// Service start
var server = http.createServer(app);
// var io = socket.listen(server);
// io.on('connection', function (socket) {
//     socket.on('message', function (from, msg) {
 
//       console.log('recieved message from', 
//                   from, 'msg', JSON.stringify(msg));
 
//       console.log('broadcasting message');
//       console.log('payload is', msg);
//       io.sockets.emit('broadcast', {
//         payload: msg,
//         source: from
//       });
//       console.log('broadcast complete');
//     });
//   });

server.listen(app.get('port'), function(){
  // Do not strip this - leave in for production
  console.log(new Date().toUTCString() + " express server listening on port " + app.get('port'));

  //@if DEV
  if (DEV) {
    console.log(_f("Refreshing all livereload clients now")); //@strip
    try { fs.mkdirSync(".tmp"); } catch(e) {};
    require('touch')(path.join(".tmp", '_livereload'));
  }
  //@end
});
