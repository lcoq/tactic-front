import Ember from 'ember';
import RunningEntryStateManager from '../models/running-entry-state-manager';

const { get, set } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  newEntryStateManager: Ember.computed('model.newEntry', function() {
    const entry = get(this, 'model.newEntry');
    return RunningEntryStateManager.create({ entry: entry });
  }),

  actions: {

    searchProjects(query) {
      if (Ember.isEmpty(query)) { return Ember.RSVP.resolve(); }
      return get(this, 'store').query('project', { filter: { query: query } });
    },

    startTimer() {
      const stateManager = get(this, 'newEntryStateManager');
      stateManager.send('start');
      stateManager.send('save');
    },

    stopTimer() {
      const stateManager = get(this, 'newEntryStateManager');
      const entry = get(this, 'model.newEntry');
      stateManager.send('stop');
      return stateManager.send('save').then(() => {
        get(this, 'model.entryList').addEntry(entry);
        get(this, 'currentWeek').reload();
        this.send('buildNewEntry');
      });
    },

    didUpdateNewEntry() {
      const stateManager = get(this, 'newEntryStateManager');
      stateManager.send('update');
    },

    buildNewEntry() {
      const entry = get(this, 'store').createRecord('entry');
      set(this, 'model.newEntry', entry);
    },

    didUpdateEntry() {
      get(this, 'currentWeek').reload();
    },

    didDeleteEntry() {
      get(this, 'currentWeek').reload();
    }
  }
});
