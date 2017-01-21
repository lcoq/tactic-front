import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),
  authentication: Ember.inject.service(),

  weeekEntries: [],
  monthEntries: [],

  currentUserId: Ember.computed.reads('authentication.userId'),

  currentUserIdChanged: Ember.observer('currentUserId', function() {
    this.reload();
  }),

  start() {
    this.reload();
  },

  reload() {
    this._fetchWeekEntries().then((entries) => {
      set(this, 'weekEntries', entries.toArray());
    });
    this._fetchMonthEntries().then((entries) => {
      set(this, 'monthEntries', entries.toArray());
    });
  },

  _fetchWeekEntries() {
    return get(this, 'store').query('entry', {
      filter: {
        'current-week': 1,
        'user-id': [get(this, 'currentUserId')]
      }
    });
  },

  _fetchMonthEntries() {
    return get(this, 'store').query('entry', {
      filter: {
        'current-month': 1,
        'user-id': [get(this, 'currentUserId')]
      }
    });
  }
});
