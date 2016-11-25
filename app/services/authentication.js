import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Service.extend({
  cookieStore: Ember.inject.service(),

  session: null,
  token: null,

  sessionName: Ember.computed.reads('session.name'),
  isRecoverable: Ember.computed.notEmpty('token'),

  isAuthenticated: Ember.computed.notEmpty('session'),
  notAuthenticated: Ember.computed.not('isAuthenticated'),

  init() {
    this._super(...arguments);
    this._retrieveToken();
  },

  authenticate(session) {
    setProperties(this, {
      session: session,
      token: get(session, 'token')
    });
    return Ember.RSVP.resolve();
  },

  _storeToken: Ember.observer('token', function() {
    const cookieStore =  get(this, 'cookieStore');
    const token = get(this, 'session.token');
    if (token !== cookieStore.getCookie('token')) {
      cookieStore.setCookie('token', token);
    }
  }),

  _retrieveToken() {
    const token = get(this, 'cookieStore').getCookie('token');
    if (token) {
      set(this, 'token', token);
    }
  }
});
