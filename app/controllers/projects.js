import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Controller.extend({

  _removeProject(project) {
    get(this, 'model').removeObject(project);
  },

  actions: {

    buildProject() {
      const newProject = get(this, 'store').createRecord('project');
      newProject.startEdit();
      get(this, 'model').pushObject(newProject);
    },

    /* edit */

    startEdit(project) {
      if (get(project, 'isInvalid')) {
        set(project, 'isInvalid', false);
      }
      project.startEdit();
    },
    stopEdit(project) {
      if (Ember.isEmpty(get(project, 'name'))) {
        setProperties(project, {
          isEditing: false,
          isInvalid: true
        });
      } else {
        project.stopEdit();
      }
    },
    cancelEdit(project) {
      project.cancelEdit();
      if (get(project, 'isDeleted')) {
        this._removeProject(project);
      }
    },

    /* delete */

    markForDelete(project) {
      if (get(project, 'isNew')) {
        this.send('cancelEdit', project);
      } else {
        project.markForDelete();
      }
    },
    didDeleteProject(project) {
      this._removeProject(project);
    }
  }
});
