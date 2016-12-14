import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  newEntry: null,

  actions: {

    searchProjects(query) {
      if (Ember.isEmpty(query)) { return Ember.RSVP.resolve(); }
      return get(this, 'store').query('project', { filter: { query: query } });
    },

    buildNewEntry() {
      const entry = get(this, 'store').createRecord('entry');
      set(this, 'newEntry', entry);
    },

    didCreateEntry(entry) {
      get(this, 'model').addEntry(entry);
      get(this, 'currentWeek').reload();
      this.send('buildNewEntry');
    },

    didUpdateEntry(entry, changedAttributes) {
      get(this, 'currentWeek').reload();
      if (changedAttributes.startedAt || changedAttributes.stoppedAt) {
        get(this, 'model').updateEntry(entry);
      }
    },

    didDeleteEntry(entry) {
      get(this, 'model').removeEntry(entry);
      get(this, 'currentWeek').reload();
    }
  }
});
