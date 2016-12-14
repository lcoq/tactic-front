import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  newEntry: null,

  actions: {

    /* new entry */

    buildNewEntry() {
      const entry = get(this, 'store').createRecord('entry');
      set(this, 'newEntry', entry);
    },
    startTimer(entry) {
      entry.start();
    },
    stopTimer(entry) {
      entry.stop();
      entry.save().then(() => {
        get(this, 'model').addEntry(entry);
        get(this, 'currentWeek').reload();
        this.send('buildNewEntry');
      });
    },

    /* edit */

    didUpdateEntry(entry, changedAttributes) {
      get(this, 'currentWeek').reload();
      if (changedAttributes.startedAt || changedAttributes.stoppedAt) {
        get(this, 'model').updateEntry(entry);
      }
    },

    /* projects */

    searchProjects(query) {
      if (Ember.isEmpty(query)) { return Ember.RSVP.resolve(); }
      return get(this, 'store').query('project', { filter: { query: query } });
    },

    selectProject(entry, project) {
      set(entry, 'project', project);
    },

    /* deletion */

    didDeleteEntry(entry) {
      get(this, 'model').removeEntry(entry);
      get(this, 'currentWeek').reload();
    }
  }
});
