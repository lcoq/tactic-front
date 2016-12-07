import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['entry', 'it-entry'],
  classNameBindings: ['isDeleting:deleting'],
  entry: null,

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  _deleteEntry() {
    set(this, 'deleteTimer', null);
    const entry = get(this, 'entry');
    get(this, 'deleteEntry')(entry);
  },

  actions: {
    deleteEntry() {
      const timer = Ember.run.later(this, this._deleteEntry, 5000);
      set(this, 'deleteTimer', timer);
    },
    revertDeleteEntry() {
      const timer = get(this, 'deleteTimer');
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  }
});
