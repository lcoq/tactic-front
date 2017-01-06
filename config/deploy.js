/* jshint node: true */

module.exports = function(deployTarget) {
  var ENV = {
    build: {}
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';

    ENV.rsync = {
      type: 'rsync',
      dest: '/home/ember-deploy/tactic-front/www',
      delete: true,
      host: 'ember-deploy@198.49.73.86',
      args: ['--verbose', '-ztl']
    }
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};

