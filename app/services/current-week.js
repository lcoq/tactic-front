import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),
  entries: [],

  start() {
    this.reload();
  },

  reload() {
    this._fetchEntries().then((entries) => {
      set(this, 'entries', entries.toArray());
    });
  },

  _fetchEntries() {
    return get(this, 'store').query('entry', {
      filter: { 'current-week': 1 },
      include: 'project'
    });
  }
});
