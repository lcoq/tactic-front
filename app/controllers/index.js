import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  newEntry: null,

  saveEntry(entry) {
    set(entry, 'saveTimer', null);
    const changedAttributes = Object.keys(entry.changedAttributes());
    const dateChanged = changedAttributes.includes('startedAt') || changedAttributes.includes('stoppedAt');
    return entry.save().then(() => {
      get(this, 'currentWeek').reload();
      if (dateChanged) { get(this, 'model').updateEntry(entry); }
    });
  },

  cancelSaveEntry(entry) {
    this._clearTimer(entry, 'saveTimer');
  },

  cancelDeleteEntry(entry) {
    this._clearTimer(entry, 'deleteTimer');
  },

  _clearTimer(object, propertyName) {
    const timer = get(object, propertyName);
    if (timer) {
      Ember.run.cancel(timer);
      set(object, propertyName, null);
    }
  },

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

    editEntry(entry) {
      this.cancelDeleteEntry(entry);
      this.cancelSaveEntry(entry);
      set(entry, 'isEditing', true);
    },

    revertEditEntry(entry) {
      this.cancelSaveEntry(entry);
      entry.rollbackAttributes();
      entry.rollbackProject();
    },

    stopEditEntry(entry) {
      const timer = Ember.run.later(this, function() {
        this.saveEntry(entry);
      }, 3000);

      setProperties(entry, {
        saveTimer: timer,
        isEditing: false
      });
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
