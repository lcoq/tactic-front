import DS from 'ember-data';
import ENV from '../config/environment';
import Ember from 'ember';

const { get } = Ember;

export default DS.JSONAPIAdapter.extend({
  namespace: ENV.APP.namespace,
  host: ENV.APP.host,

  authentication: Ember.inject.service(),

  headers: Ember.computed('authentication.token', function() {
    const headers = {};
    const token = get(this, 'authentication.token');
    if (token) { headers['Authorization'] = token;  }
    return headers;
  })
});
