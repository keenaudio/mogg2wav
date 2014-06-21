
module.exports = function(config) {

  var secureCookies = true;
  
  //@if DEV
  if (config.get('dev')) {
    secureCookies = false;
  }
  //@end
  
  // Passport auth
  config.merge({
    "passport": {
      "secure": secureCookies,
      "proxy": true
    }
  });

}