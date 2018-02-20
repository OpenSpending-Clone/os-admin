'use strict';

require('js-polyfills/xhr');
require('isomorphic-fetch');

var _ = require('lodash');

// Init some global variables - needed for proper work of angular and
// some other 3rd-party libraries
(function(globals) {
  globals._ = _;

  var jquery = require('jquery');
  globals.jQuery = globals.$ = jquery;

  // fetch() polyfill
  require('isomorphic-fetch/fetch-npm-browserify');

  require('os-bootstrap/dist/js/os-bootstrap');

  // Make config global available to app, then load scripts that require
  // globalConfig.
  $.get('config.json')
    .then(function(config) {
      globals.globalConfig = Object.assign({}, globals.globalConfig, config);
      return globals.globalConfig;
    })
    .then(function(globalConfig) {
      // Load snippets (requires globalConfig)
      $.getScript('./public/scripts/snippets.js')
        .fail(function(jqxhr, settings, exception) {
          throw(exception);
        });
      return globalConfig;
    })
    .then(function(globalConfig) {
      // Load externally hosted authClient.services lib (makes `authenticate`
      // and `authorize` services available to angular modules).
      var libUrl = globalConfig.conductorUrl + '/user/lib';
      $.getScript(libUrl)
        .fail(function(jqxhr, settings, exception) {
          console.log('Unable to load authClient.services from ' + libUrl);
        });
    });

  var angular = require('angular');
  globals.angular = angular;
  if (typeof globals.Promise != 'function') {
    globals.Promise = require('bluebird');
  }

  globals.addEventListener('load', function() {
    require('./application');
    angular.bootstrap(globals.document, ['Application']);
  });
})(window);
