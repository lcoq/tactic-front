import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({

  _removeProject(project) {
    get(this, 'model').removeObject(project);
  },

  actions: {

    buildProject() {
      const newProject = get(this, 'store').createRecord('project');
      newProject.edit();
      get(this, 'model').pushObject(newProject);
    },

    /* edit */

    startEdit(project) {
      project.edit();
    },
    stopEdit(project) {
      project.markForSave();
    },
    cancelEdit(project) {
      project.clear();
      if (get(project, 'isDeleted')) {
        this._removeProject(project);
      }
    },

    /* delete */

    markForDelete(project) {
      project.markForDelete();
    },
    clearMarkForDelete(project) {
      project.clear();
    },
    didDeleteProject(project) {
      this._removeProject(project);
    }
  }
});
