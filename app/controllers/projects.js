import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({

  _clearMarkClientForDeleteForProject(project) {
    const group = get(this, 'model').findGroupByProject(project);
    const client = get(group, 'client');
    if (get(client, 'isPendingDeleteOrDeleteErrored')) {
      this.send('clearMarkClientForDelete', client);
    }
  },

  actions: {

    /* CLIENTS */

    buildClient() {
      const client = get(this, 'store').createRecord('client');
      client.edit();
      get(this, 'model').addClient(client);
    },

    /* edit */

    startEditClient(client) {
      client.edit();
    },
    stopEditClient(client) {
      client.markForSave();
    },
    cancelEditClient(client) {
      client.clear();
      if (get(client, 'isDeleted')) {
        get(this, 'model').removeClient(client);
      }
    },

    /* delete */

    markClientForDelete(client) {
      client.markForDelete();
    },
    clearMarkClientForDelete(client) {
      client.clear();
    },
    didDeleteClient(client) {
      get(this, 'model').removeClient(client);
    },

    /* retry */

    retrySaveClient(client) {
      client.retry();
    },

    retryDeleteClient(client) {
      client.retry();
    },


    /* PROJECTS */

    buildProject(client) {
      const project = get(this, 'store').createRecord('project', { client: client });
      project.edit();
      get(this, 'model').addProject(project).then(() => {
        this._clearMarkClientForDeleteForProject(project);
      });
    },

    /* edit */

    startEditProject(project) {
      this._clearMarkClientForDeleteForProject(project);
      project.edit();
    },
    stopEditProject(project) {
      project.markForSave();
    },
    cancelEditProject(project) {
      this._clearMarkClientForDeleteForProject(project);
      project.clear();
      if (get(project, 'isDeleted')) {
        get(this, 'model').removeProject(project);
      }
    },

    /* delete */

    markProjectForDelete(project) {
      project.markForDelete();
    },
    clearMarkProjectForDelete(project) {
      project.clear();
    },
    didDeleteProject(project) {
      get(this, 'model').removeProject(project);
    },

    /* retry */

    retrySaveProject(project) {
      project.retry();
    },

    retryDeleteProject(project) {
      project.retry();
    }
  }
});
