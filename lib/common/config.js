var Config; // global exports

var assert, merge; //@strip

(function() {

//@if NODE
if (typeof exports !== "undefined") {
  merge = require('merge');
  assert = require('assert'); //@strip
}
//@end

//@if LOG
var _ls = "Lib.Config";
var _f = function(msg) { return "[" + _ls + "] " + msg; }
//@end

Config = function() {
 this.config = {};
}

Config.prototype.get = function(key, defaultValue) {
 if (!key) {
  return this.config;
 }
 assert(typeof(key) === 'string'); //@strip
 var parts = key.split('.');
 var obj = this.config;
 for (var i = 0; i < parts.length; i++) {
  obj = obj[parts[i]];
  if (obj === undefined) {
   if (defaultValue === undefined) assert(false, "No config found for key: " + key); //@strip
   return defaultValue || obj;
  }
 }
 return obj;
}

Config.prototype.set = function(key, value) {
 assert(typeof(key) === 'string'); //@strip
 var parts = key.split('.');
 assert(parts.length > 0); //@strip
 var obj = this.config;
 var lastKey = parts[parts.length-1];
 assert(lastKey); //@strip
 if (obj.hasOwnProperty(lastKey)) console.log(_f("Overwriting property: " + key + " with value: " + value)); //@strip
 for (var i = 0; i < parts.length-1; i++) {
  var keyPart = parts[i];
  var obj2 = obj[keyPart];
  if (!obj2) {
   console.log(_f("Creating blank object for property: " + keyPart)); //@strip
   obj2 = obj[keyPart] = {};
  }
  obj = obj2;
 }
 obj[lastKey] = value;
 return value;
}
Config.prototype.merge = function(obj) {
 if (!obj) return;
 console.log(_f('merging config obj: ' + JSON.stringify(obj))); //@strip
 this.config = merge(true, this.config, obj);
 console.log(_f('config is now:' + JSON.stringify(this.config))); //@strip
}

})();

//@if NODE
if (typeof exports !== "undefined") {
  exports.Config = Config;
}
//@end
