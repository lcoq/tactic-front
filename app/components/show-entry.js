import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['entry', 'it-entry'],
  classNameBindings: ['isEditing:editing', 'isDeleting:deleting', 'isPending:pending'],
  entry: null,

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  saveTimer: null,
  isPending: Ember.computed.bool('saveTimer'),

  isEditing: false,

  _revertChanges() {
    const entry = get(this, 'entry');
    entry.rollbackAttributes();
  },

  _cancelSaveAndDelete() {
    this._cancelDelete();
    this._cancelSave();
  },

  _cancelDelete() {
    const timer = get(this, 'deleteTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  },

  _cancelSave() {
    const timer = get(this, 'saveTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'saveTimer', null);
    }
  },

  _saveEntry() {
    set(this, 'saveTimer', null);
    const entry = get(this, 'entry');
    get(this, 'saveEntry')(entry);
  },

  _deleteEntry() {
    set(this, 'deleteTimer', null);
    const entry = get(this, 'entry');
    get(this, 'deleteEntry')(entry);
  },

  actions: {
    clearFocus() {
      document.activeElement.blur();
    },
    focusLost() {
      const timer = Ember.run.later(this, this._saveEntry, 5000);
      setProperties(this, { saveTimer: timer, isEditing: false });
    },
    editEntry(selector) {
      this._cancelSaveAndDelete();
      set(this, 'isEditing', true);
      Ember.run.scheduleOnce('afterRender', this, function() { this.$(selector).focus(); });
    },
    revertEditEntry() {
      this._cancelSave();
      this._revertChanges();
    },
    deleteEntry() {
      const timer = Ember.run.later(this, this._deleteEntry, 5000);
      set(this, 'deleteTimer', timer);
    },
    revertDeleteEntry() {
      this._cancelDelete();
    }
  }
});
