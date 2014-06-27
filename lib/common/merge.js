if (typeof define !== 'function') { 
  module.exports = require('merge');
} else {
  define(['jquery'], function($) {
    return $.extend;
  });
}