import Ember from 'ember';
import RunningEntryStateManager from '../models/running-entry-state-manager';

const { get, set } = Ember;

export default Ember.Controller.extend({
  userSummary: Ember.inject.service(),

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
    },

    stopTimer() {
      const stateManager = get(this, 'newEntryStateManager');
      const entry = get(this, 'model.newEntry');
      stateManager.send('stop').then(() => {
        get(this, 'model.entryList').addEntry(entry);
        get(this, 'userSummary').reload();
        this.send('buildNewEntry');
      }, () => {
        if (get(stateManager, 'isSaveErrored')) {
          // TODO move new entry state manager logic to the entry state manager ?
          get(entry, '_stateManager')._transitionTo('saveError');
        }
        get(this, 'model.entryList').addEntry(entry);
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
      get(this, 'userSummary').reload();
    },

    didDeleteEntry() {
      get(this, 'userSummary').reload();
    }
  }
});
