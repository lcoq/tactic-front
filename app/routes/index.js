import Ember from 'ember';
import EntryGroupByDayList from '../models/entry-group-by-day-list';

const { get, set } = Ember;

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

  actions: {
    willTransition(transition) {
      if (transition.data.restored) { return; }
      transition.abort();

      const controller = this.controller;
      let promises = [];

      const newEntryStateManager = get(controller, 'newEntryStateManager');

      if (get(newEntryStateManager, 'isPendingSave')) {
        promises.push(newEntryStateManager.send('forceSave'));
      }

      const entries = get(controller, 'model.entryList.entries');

      const deletePromises = entries.filterBy('isDeleting', true).map(function(entryToDelete) {
        entryToDelete.clearMarkForDelete();
        return entryToDelete.destroyRecord();
      });
      const updatePromises = entries.filterBy('isPending', true).map(function(entryToUpdate) {
        entryToUpdate.clearMarkForSave();
        return entryToUpdate.save();
      });
      const editPromises = entries.filterBy('isEditing', true).map(function(entryToUpdate) {
        set(entryToUpdate, 'isEditing', false);
        return entryToUpdate.save();
      });

      promises.pushObjects(deletePromises);
      promises.pushObjects(updatePromises);
      promises.pushObjects(editPromises);

      Ember.RSVP.all(promises).then(function() {
        transition.data.restored = true;
        transition.retry();
      }, () => {
        /* an entry cannot be saved */
      });
    }
  }
});
