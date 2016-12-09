import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  newEntry: null,

  actions: {
    searchProjects(query) {
      return get(this, 'store').query('project', { filter: { query: query } });
    },
    buildNewEntry() {
      const entry = get(this, 'store').createRecord('entry');
      set(this, 'newEntry', entry);
    },
    saveNewEntry() {
      const entry = get(this, 'newEntry');
      entry.save().then(() => {
        get(this, 'model').addEntry(entry);
        get(this, 'currentWeek').reload();
        this.send('buildNewEntry');
      });
    },
    saveEntry(entry) {
      const changedAttributes = Object.keys(entry.changedAttributes());
      const dateChanged = changedAttributes.includes('startedAt') || changedAttributes.includes('stoppedAt');
      return entry.save().then(() => {
        get(this, 'currentWeek').reload();
        if (dateChanged) {
          get(this, 'model').updateEntry(entry);
        }
      });
    },
    deleteEntry(entry) {
      entry.destroyRecord().then(() => {
        get(this, 'model').removeEntry(entry);
        get(this, 'currentWeek').reload();
      });
    }
  }
});
