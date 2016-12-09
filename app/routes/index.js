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
    return get(this, 'store').query('entry', { include: 'project' }).then((entries) => {
      return EntryGroupByDayList.create({ entries: entries.toArray() });
    });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.send('buildNewEntry');
  },

  actions: {
    willTransition(transition) {
      if (transition.data.restored) { return; }
      transition.abort();

      const controller = this.controller;
      const entries = get(controller, 'model.entries');

      const deletePromises = entries.filterBy('isDeleting', true).map(function(entryToDelete) {
        Ember.run.cancel(get(entryToDelete, 'deleteTimer'));
        set(entryToDelete, 'deleteTimer', null);
        return entryToDelete.destroyRecord();
      });
      const updatePromises = entries.filterBy('isPending', true).map(function(entryToUpdate) {
        Ember.run.cancel(get(entryToUpdate, 'saveTimer'));
        set(entryToUpdate, 'saveTimer', null);
        return entryToUpdate.save();
      });
      const editPromises = entries.filterBy('isEditing', true).map(function(entryToUpdate) {
        set(entryToUpdate, 'isEditing', false);
        return entryToUpdate.save();
      });

      const promises = deletePromises.concat(updatePromises).concat(editPromises);
      Ember.RSVP.all(promises).then(function() {
        transition.data.restored = true;
        transition.retry();
      }, () => {
        /* an entry cannot be saved */
      });
    }
  }
});
