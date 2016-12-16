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
    return get(this, 'store').query('project', {}).then((projects) => {
      return projects.toArray();
    });
  },

  actions: {
    willTransition(transition) {
      const controller = this.controller;
      const projects = get(controller, 'model');

      projects.filterBy('isEditing', true).forEach(function(p) {
        p.markForSave();
      });

      const invalidProjects = projects.filterBy('isInvalid', true);
      const pendingDeleteProjects = projects.filterBy('isPendingDelete', true);
      const pendingSaveProjects = projects.filterBy('isPendingSave', true);

      if (get(invalidProjects, 'length') > 0 && !confirm("Some edited projects are invalid, do you want to cancel your changes ? ")) {
        transition.abort();
        return;
      }

      invalidProjects.forEach(function(p) { p.clear(); });

      if (get(pendingDeleteProjects, 'length') > 0 || get(pendingSaveProjects, 'length') > 0) {
        transition.abort();

        const deletePromises = pendingDeleteProjects.map(function(p) {
          return p.forceDelete();
        });
        const updatePromises = pendingSaveProjects.map(function(p) {
          return p.forceSave();
        });

        const promises = deletePromises.concat(updatePromises);

        Ember.RSVP.all(promises).then(function() {
          transition.retry();
        });
      }
    }
  }
});
