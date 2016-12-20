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
    const projectsPromise = get(this, 'store').query('project', {}).then((projects) => {
      const noProject = Ember.Object.create({ id: '0', name: "No project" });
      return [noProject].concat(projects.toArray());
    });

    return Ember.RSVP.hash({
      users: get(this, 'store').query('user', {}),
      projects: projectsPromise,
      clients: get(this, 'store').query('client', {})
    });
  }
});
