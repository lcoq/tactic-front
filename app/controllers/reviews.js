import Ember from 'ember';
import EntryGroupByClientAndProjectList from '../models/entry-group-by-client-and-project-list';
import moment from 'moment';

const { get, set, merge } = Ember;

export default Ember.Controller.extend({
  userSummary: Ember.inject.service(),

  entries: Ember.computed('selectedUsers.@each.id', 'selectedProjects.@each.id', 'since', 'before', 'query', function() {
    const selectedUserIds = get(this, 'selectedUsers').mapBy('id');
    const selectedProjectIds = get(this, 'selectedProjects').mapBy('id');

    if (get(selectedUserIds, 'length') === 0 || get(selectedProjectIds, 'length') === 0) {
      return [];
    }

    const filters = {
      'since': moment(get(this, 'since')).startOf('day').toISOString(),
      'before': moment(get(this, 'before')).endOf('day').toISOString(),
      'user-id': selectedUserIds,
      'project-id': selectedProjectIds
    };

    let query = get(this, 'query');
    if (Ember.isPresent(query)) {
      filters['query'] = query;
    }

    return get(this, 'store').query('entry', { filter: filters });
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

  rounding: false,

  query: null,

  _downloadFile(url) {
    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.classList = [ "hidden" ];
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  },

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

    updateQuery(newQuery) {
      set(this, 'query', newQuery);
    },

    searchProjects(query) {
      if (Ember.isEmpty(query)) { return Ember.RSVP.resolve(); }
      return get(this, 'store').query('project', { filter: { query: query } });
    },

    didUpdateEntry() {
      get(this, 'userSummary').reload();
    },

    didDeleteEntry() {
      get(this, 'userSummary').reload();
    },

    generateCSV(additionalFilters = {}) {
      let projectIds;

      if (additionalFilters.hasOwnProperty('client')) {
        const clientId = additionalFilters.client && additionalFilters.client.get('id') || '0';
        projectIds = get(this, 'selectedProjects').filter(function(project) {
          return clientId === (get(project, 'client.id') || '0');
        }).mapBy('id');
      }
      else if (additionalFilters.hasOwnProperty('project')) {
        projectIds = [ additionalFilters.project.get('id') || '0' ];
      }
      else {
        projectIds = get(this, 'selectedProjects').mapBy('id');
      }

      const filters = {
        'since': moment(get(this, 'since')).startOf('day').toISOString(),
        'before': moment(get(this, 'before')).endOf('day').toISOString(),
        'user-id': get(this, 'selectedUsers').mapBy('id'),
        'project-id': projectIds
      };
      let query = get(this, 'query');
      if (Ember.isPresent(query)) {
        filters['query'] = query;
      }

      const options = {};
      if (get(this, 'rounding')) {
        options['rounded'] = 1;
      }

      const adapter = get(this, 'store').adapterFor('entry');
      const params = adapter.sortQueryParams(merge({ filter: filters, options: options }, adapter.get('headers')));
      const pathWithoutParams = adapter.buildURL('entry', null, null, 'query', params) + '.csv';
      const url = [ pathWithoutParams, Ember.$.param(params) ].join('?');
      this._downloadFile(url);
    }
  }
});
