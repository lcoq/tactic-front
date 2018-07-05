import Ember from 'ember';
import EntryGroupByDayList from '../models/entry-group-by-day-list';

const { get, setProperties } = Ember;

export default Ember.Route.extend({
  authentication: Ember.inject.service(),

  beforeModel() {
    if (get(this, 'authentication.notAuthenticated')) {
      this.transitionTo('login');
    }
  },

  model() {
    const store = get(this, 'store');
    const entryList = store.query('entry', { include: 'project' }).then(function(entries) {
      return EntryGroupByDayList.create({ entries: entries.toArray() });
    });
    const runningEntry = store.queryRecord('entry', { filter: { running: 1 }, include: 'project' }).then(function(entry) {
      if (!entry) {
        return store.createRecord('entry');
      } else {
        return entry;
      }
    });
    return Ember.RSVP.hash({ entryList: entryList, newEntry: runningEntry });
  },

  setupController(controller) {
    this._super(...arguments);
    setProperties(controller, {
      waitingEntries: [],
      shouldUpdateSummary: false
    });
  },

  actions: {
    willTransition(transition) {
      const controller = this.controller;
      let promises = [];

      /* new entry */

      const newEntryStateManager = get(controller, 'newEntryStateManager');
      const newEntryIsPendingSave = get(newEntryStateManager, 'isPendingSave');
      const newEntryIsSaveErrored = get(newEntryStateManager, 'isSaveErrored');

      /* entry list */

      const entries = get(controller, 'model.entryList.entries');
      entries.filterBy('isEditing', true).forEach(function(e) { e.markForSave(); });

      const pendingDeleteEntries = entries.filterBy('isPendingDelete', true);
      const pendingSaveEntries = entries.filterBy('isPendingSave', true);
      const erroredEntries = entries.filterBy('isErrored', true);

      const hasPendingEntriesFromList = get(pendingDeleteEntries, 'length') > 0 || get(pendingSaveEntries, 'length') > 0 || get(erroredEntries, 'length') > 0;

      if (newEntryIsPendingSave || newEntryIsSaveErrored || hasPendingEntriesFromList) {
        transition.abort();

        const deletePromises = pendingDeleteEntries.map(function(e) { return e.forceDelete(); });
        const updatePromises = pendingSaveEntries.map(function(e) { return e.forceSave(); });
        const retryPromises = erroredEntries.map(function(e) { return e.retry(); });
        promises.pushObjects(deletePromises);
        promises.pushObjects(updatePromises);
        promises.pushObjects(retryPromises);

        let newEntryPromise = Ember.RSVP.resolve();
        if (newEntryIsPendingSave) {
          newEntryPromise = newEntryStateManager.send('forceSave');
        } else if (newEntryIsSaveErrored) {
          newEntryPromise = newEntryStateManager.send('retry');
        }
        promises.pushObject(newEntryPromise);

        Ember.RSVP.all(promises).then(function() {
          transition.retry();
        }, () => {
          alert("Some edits cannot be saved, please review your changes or try again.");
        });
      }
    }
  }
});
