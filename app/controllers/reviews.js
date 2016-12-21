import Ember from 'ember';
import EntryGroupByClientAndProjectList from '../models/entry-group-by-client-and-project-list';
import moment from 'moment';

const { get, set } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  entries: Ember.computed('selectedUsers.@each.id', 'selectedProjects.@each.id', 'since', 'before', function() {
    const selectedUserIds = get(this, 'selectedUsers').mapBy('id');
    const selectedProjectIds = get(this, 'selectedProjects').mapBy('id');

    if (get(selectedUserIds, 'length') === 0 || get(selectedProjectIds, 'length') === 0) {
      return [];
    }

    return get(this, 'store').query('entry', {
      filter: {
        'since': moment(get(this, 'since')).startOf('day').toISOString(),
        'before': moment(get(this, 'before')).endOf('day').toISOString(),
        'user-id': selectedUserIds,
        'project-id': selectedProjectIds
      }
    });
  }),

  entriesByClientAndProject: Ember.computed('entries.[]', function() {
    const entries = get(this, 'entries');
    return EntryGroupByClientAndProjectList.create({ entries: entries.toArray() });
  }),

  selectedUsers: Ember.computed('model.users', function() {
    return get(this, 'model.users').toArray();
  }),

  selectedClients: Ember.computed('model.clients', function() {
    return get(this, 'model.clients').toArray();
  }),

  projects: Ember.computed('selectedClients', 'model.projects', function() {
    const selectedClientIds = get(this, 'selectedClients').mapBy('id');
    const projects = get(this, 'model.projects');
    return projects.filter(function(project) {
      return selectedClientIds.includes(get(project, 'client.id') || '0');
    });
  }),

  selectedProjects: Ember.computed('projects', function() {
    return get(this, 'projects').toArray();
  }),

  since: Ember.computed(function() {
    return moment().startOf('month').hours(0).minutes(0).seconds(0).toDate();
  }),

  before: Ember.computed(function() {
    return moment().hours(0).minutes(0).seconds(0).toDate();
  }),

  actions: {
    updateSelectedUsers(newUsers) {
      set(this, 'selectedUsers', newUsers);
    },

    updateSelectedClients(newClients) {
      const previousClients = get(this, 'selectedClients');
      const addedClientIds = newClients.filter(function(client) {
        return previousClients.indexOf(client) === -1;
      }).mapBy('id');

      set(this, 'selectedClients', newClients);

      const projects = get(this, 'projects');
      const previousSelectedProjectIds = get(this, 'selectedProjects').mapBy('id');

      const newProjects = projects.filter(function(project) {
        return previousSelectedProjectIds.includes(get(project, 'id') || '0') ||
          addedClientIds.includes(get(project, 'client.id') || '0');
      });

      set(this, 'selectedProjects', newProjects);
    },

    updateSelectedProjects(newProjects) {
      set(this, 'selectedProjects', newProjects);
    },

    searchProjects(query) {
      if (Ember.isEmpty(query)) { return Ember.RSVP.resolve(); }
      return get(this, 'store').query('project', { filter: { query: query } });
    },

    didUpdateEntry() {
      get(this, 'currentWeek').reload();
    },

    didDeleteEntry() {
      get(this, 'currentWeek').reload();
    }
  }
});
