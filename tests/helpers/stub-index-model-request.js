import Ember from 'ember';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

export default Ember.Test.registerHelper('stubIndexModelRequest', function(app, server) {
  const data = [{ type: 'entries', id: '1', attributes: { title: 'my-entry' } }];
  server.get(url('entries'), function() { return [ 200, {}, { data: data }]; });
});
