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

    const clientsPromise = get(this, 'store').query('client', {}).then((clients) => {
      const noClient = Ember.Object.create({ id: '0', name: "No client" });
      return [noClient].concat(clients.toArray());
    });

    return Ember.RSVP.hash({
      users: get(this, 'store').query('user', {}),
      projects: projectsPromise,
      clients: clientsPromise
    });
  },

  actions: {
    willTransition(transition) {
      const controller = this.controller;
      let promises = [];

      const entries = get(controller, 'entries');
      entries.filterBy('isEditing', true).forEach(function(e) { e.markForSave(); });

      const pendingDeleteEntries = entries.filterBy('isPendingDelete', true);
      const pendingSaveEntries = entries.filterBy('isPendingSave', true);
      const erroredEntries = entries.filterBy('isErrored', true);

      if(get(pendingDeleteEntries, 'length') > 0 || get(pendingSaveEntries, 'length') > 0 || get(erroredEntries, 'length') > 0) {
        transition.abort();

        const deletePromises = pendingDeleteEntries.map(function(e) { return e.forceDelete(); });
        const updatePromises = pendingSaveEntries.map(function(e) { return e.forceSave(); });
        const retryPromises = erroredEntries.map(function(e) { return e.retry(); });
        promises.pushObjects(deletePromises);
        promises.pushObjects(updatePromises);
        promises.pushObjects(retryPromises);

        Ember.RSVP.all(promises).then(function() {
          transition.retry();
        }, () => {
          alert("Some edits cannot be saved, please review your changes or try again.");
        });
      }
    }
  }
});
