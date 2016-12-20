import Ember from 'ember';
import EntryGroupByClientAndProjectList from '../models/entry-group-by-client-and-project-list';
import moment from 'moment';

const { get } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  entries: Ember.computed('selectedUsers.@each.id', 'selectedProjects.@each.id', 'since', 'before', function() {
    return get(this, 'store').query('entry', {
      filter: {
        'since': moment(get(this, 'since')).startOf('day').toISOString(),
        'before': moment(get(this, 'before')).endOf('day').toISOString(),
        'user-id': get(this, 'selectedUsers').mapBy('id'),
        'project-id': get(this, 'selectedProjects').mapBy('id')
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

  selectedProjects: Ember.computed('model.projects', function() {
    return get(this, 'model.projects').toArray();
  }),

  since: Ember.computed(function() {
    return moment().startOf('month').hours(0).minutes(0).seconds(0).toDate();
  }),

  before: Ember.computed(function() {
    return moment().hours(0).minutes(0).seconds(0).toDate();
  }),

  actions: {

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
