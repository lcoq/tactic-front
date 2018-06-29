import Ember from 'ember';
import RunningEntryStateManager from '../models/running-entry-state-manager';

const { get, set } = Ember;

function entryIsStoppedLocallyButStillRunningOnApi(entry) {
  if (!get(entry, 'isSaveErrored')) {
    return false;
  }
  // stoppedAt can be :
  //   * set
  //   *`undefined` on new records
  //   * `null` on running entry saved
  const changedAttributes = entry.changedAttributes();
  return changedAttributes.stoppedAt && changedAttributes.stoppedAt[0] === null;
}

export default Ember.Controller.extend({
  userSummary: Ember.inject.service(),

  newEntryStateManager: Ember.computed('model.newEntry', function() {
    const entry = get(this, 'model.newEntry');
    return RunningEntryStateManager.create({ entry: entry });
  }),

  _stopNewEntryAndAddItToEntryList() {
    const stateManager = get(this, 'newEntryStateManager');
    const entry = get(this, 'model.newEntry');
    return stateManager.send('stop').then(() => {
      get(this, 'userSummary').reload();
    }, () => {
      if (get(stateManager, 'isSaveErrored')) {
        // TODO move new entry state manager logic to the entry state manager ?
        get(entry, '_stateManager')._transitionTo('saveError');
      }
      return Ember.RSVP.reject();
    }).finally(() => {
      get(this, 'model.entryList').addEntry(entry);
    });
  },

  _updateIcon(name) {
    Ember.$("link[rel*='icon']").each(function() {
      Ember.$(this).attr('href', Ember.$(this).data('href-' + name));
    });
  },

  actions: {

    searchProjects(query) {
      if (Ember.isEmpty(query)) { return Ember.RSVP.resolve(); }
      return get(this, 'store').query('project', { filter: { query: query } });
    },

    startTimer() {
      const stateManager = get(this, 'newEntryStateManager');
      stateManager.send('start');
      this._updateIcon('started');
    },

    stopTimer() {
      this._stopNewEntryAndAddItToEntryList().finally(() => {
        this.send('buildNewEntry');
      this._updateIcon('stopped');
      });
    },

    didUpdateNewEntry() {
      const stateManager = get(this, 'newEntryStateManager');
      stateManager.send('update');
    },

    retrySaveNewEntry() {
      const stateManager = get(this, 'newEntryStateManager');
      const retry = function() { stateManager.send('retry'); };
      const runningEntryStoppedOnlyLocally = get(this, 'model.entryList.entries').find(entryIsStoppedLocallyButStillRunningOnApi);
      if (runningEntryStoppedOnlyLocally) {
        runningEntryStoppedOnlyLocally.retry().then(retry);
      } else {
        retry();
      }
    },

    buildNewEntry(attributes) {
      const entry = get(this, 'store').createRecord('entry', attributes || {});
      set(this, 'model.newEntry', entry);
    },

    didUpdateEntry() {
      get(this, 'userSummary').reload();
    },

    didDeleteEntry() {
      get(this, 'userSummary').reload();
    },

    restartEntry(entry) {
      let beforePromise = Ember.RSVP.resolve();
      if (get(this, 'model.newEntry.isStarted')) {
        beforePromise = this._stopNewEntryAndAddItToEntryList();
      }
      beforePromise.finally(() => {
        this.send('buildNewEntry', entry.getProperties('title', 'project'));
        this.send('startTimer');
      });
    }
  }
});
