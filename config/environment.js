/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'tactic-front',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
      }
    },

    APP: {
      namespace: ''
    }
  };

  if (environment === 'development') {
    ENV.APP.host = 'http://localhost:3000';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.APP.host = 'https://tactic.herokuapp.com';
  }

  return ENV;
};
