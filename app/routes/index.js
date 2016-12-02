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
    return get(this, 'store').query('entry', { include: 'project' });
  }
});
