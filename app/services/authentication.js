import Ember from 'ember';

const { set } = Ember;

export default Ember.Service.extend({
  session: null,
  sessionName: Ember.computed.reads('session.name'),

  isAuthenticated: Ember.computed.notEmpty('session'),
  notAuthenticated: Ember.computed.not('isAuthenticated'),

  authenticate(session) {
    set(this, 'session', session);
    return Ember.RSVP.resolve();
  }
});
