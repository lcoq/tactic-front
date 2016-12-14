import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Route.extend({
  authentication: Ember.inject.service(),

  beforeModel() {
    if (get(this, 'authentication.notAuthenticated')) {
      this.transitionTo('login');
    }
  },

  model() {
    return get(this, 'store').findAll('project');
  },

  actions: {
    willTransition(transition) {
      if (transition.data.restored) { return; }
      transition.abort();

      const controller = this.controller;
      const projects = get(controller, 'model');

      const deletePromises = projects.filterBy('isDeleting', true).map(function(projectToDelete) {
        projectToDelete.clearMarkForDelete();
        return projectToDelete.destroyRecord();
      });
      const updatePromises = projects.filterBy('isPending', true).map(function(projectToUpdate) {
        projectToUpdate.clearMarkForSave();
        return projectToUpdate.save();
      });
      const editPromises = projects.filterBy('isEditing', true).map(function(projectToUpdate) {
        set(projectToUpdate, 'isEditing', false);
        return projectToUpdate.save();
      });

      const promises = deletePromises.concat(updatePromises).concat(editPromises);
      Ember.RSVP.all(promises).then(function() {
        transition.data.restored = true;
        transition.retry();
      }, () => {
        /* a project cannot be saved */
      });
    }
  }
});
