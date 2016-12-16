import Ember from 'ember';
import ProjectGroupByClientList from '../models/project-group-by-client-list';

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
      clients: get(this, 'store').query('client', {}),
      projects: get(this, 'store').query('project', {})
    }).then((hash) => {
      const noClient = Ember.Object.create({
        id: '0',
        name: "No client",
        projects: Ember.RSVP.resolve([]),
        isFrozen: true
      });
      const clients = [noClient].concat(hash.clients.toArray());
      const projects = hash.projects.toArray();
      return ProjectGroupByClientList.create({ clients: clients, projects: projects });
    });
  },

  actions: {
    willTransition(transition) {
      const controller = this.controller;
      const projects = get(controller, 'model.projects');
      const clients = get(controller, 'model.clients');

      projects.filterBy('isEditing', true).forEach(function(project) { project.markForSave(); });
      clients.filterBy('isEditing', true).forEach(function(client) { client.markForSave(); });

      const invalidProjects = projects.filterBy('isInvalid', true);
      const pendingDeleteProjects = projects.filterBy('isPendingDelete', true);
      const pendingSaveProjects = projects.filterBy('isPendingSave', true);

      const invalidClients = clients.filterBy('isInvalid', true);
      const pendingDeleteClients = clients.filterBy('isPendingDelete', true);
      const pendingSaveClients = clients.filterBy('isPendingSave', true);

      const hasInvalidProjectOrClient = get(invalidProjects, 'length') > 0 || get(invalidClients, 'length') > 0;

      if (hasInvalidProjectOrClient && !confirm("Some edits are invalid, do you want to cancel your invalid changes ? ")) {
        transition.abort();
        return;
      }

      invalidProjects.forEach(function(project) { project.clear(); });
      invalidClients.forEach(function(client) { client.clear(); });

      const hasPendingProjects = get(pendingDeleteProjects, 'length') > 0 || get(pendingSaveProjects, 'length') > 0;
      const hasPendingClients = get(pendingDeleteClients, 'length') > 0 || get(pendingSaveClients, 'length') > 0;

      if (hasPendingProjects || hasPendingClients) {
        transition.abort();

        const projectDeletePromises = pendingDeleteProjects.map(function(p) { return p.forceDelete(); });
        const projectUpdatePromises = pendingSaveProjects.map(function(p) { return p.forceSave(); });
        const projectPromises = projectDeletePromises.concat(projectUpdatePromises);

        const clientDeletePromises = pendingDeleteClients.map(function(p) { return p.forceDelete(); });
        const clientUpdatePromises = pendingSaveClients.map(function(p) { return p.forceSave(); });
        const clientPromises = clientDeletePromises.concat(clientUpdatePromises);

        const promises = projectPromises.concat(clientPromises);
        Ember.RSVP.all(promises).then(function() {
          transition.retry();
        }, function() {
          alert("Some edits cannot be saved, please review your changes or try again.");
        });
      }
    }
  }
});
