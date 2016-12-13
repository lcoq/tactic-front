import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  authentication: Ember.inject.service(),

  beforeModel() {
    if (get(this, 'authentication.notAuthenticated')) {
      this.transitionTo('login');
    }
  },

  model() {
    return Ember.RSVP.hash({
      users: get(this, 'store').findAll('user'),
      projects: get(this, 'store').findAll('project')
    });
  }
});
