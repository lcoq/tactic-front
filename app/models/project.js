import DS from 'ember-data';
import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default DS.Model.extend({
  name: DS.attr(),

  /* save */

  saveTimer: null,
  isPending: Ember.computed.bool('saveTimer'),

  saveProject() {
    set(this, 'saveTimer', null);
    return this.save();
  },

  markForSave() {
    const timer = Ember.run.later(this, this.saveProject, 3000);
    setProperties(this, { saveTimer: timer, isEditing: false });
  },

  clearMarkForSave() {
    this._clearTimer('saveTimer');
  },

  /* edit */

  isEditing: false,

  startEdit() {
    this.clearMarkForSave();
    set(this, 'isEditing', true);
  },

  stopEdit() {
    this.markForSave();
  },

  cancelEdit() {
    this.clearMarkForSave();
    this.rollbackAttributes();
  },

  /* delete */

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  markForDelete() {
    const timer = Ember.run.later(this, this.deleteProject, 3000);
    setProperties(this, { deleteTimer: timer, isEditing: false });
  },

  clearMarkForDelete() {
    this._clearTimer('deleteTimer');
  },

  deleteProject() {
    set(this, 'deleteTimer', null);
    return this.destroyRecord();
  },



  _clearTimer(propertyName) {
    const timer = get(this, propertyName);
    if (timer) {
      Ember.run.cancel(timer);
      set(this, propertyName, null);
    }
  }
});
