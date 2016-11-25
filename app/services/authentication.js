import Ember from 'ember';

const { set } = Ember;

export default Ember.Service.extend({
  user: null,

  authenticated: Ember.computed.notEmpty('user'),
  notAuthenticated: Ember.computed.not('authenticated'),

  authenticate(user) {
    set(this, 'user', user);
    return Ember.RSVP.resolve();
  }
});
