import Ember from 'ember';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

export default Ember.Test.registerAsyncHelper('stubLoginModelRequest', function(app, server) {
  const data = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  server.get(url('users'), function() { return [ 200, {}, { data: data }]; });
});
