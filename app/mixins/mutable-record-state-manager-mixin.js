import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Mixin.create({
  stateManagerClass: null,

  _stateManager: null,

  isClear: Ember.computed.reads('_stateManager.isClear'),
  isEditing: Ember.computed.reads('_stateManager.isEditing'),
  isInvalid: Ember.computed.reads('_stateManager.isInvalid'),
  isPendingSave: Ember.computed.reads('_stateManager.isPendingSave'),
  isPendingDelete: Ember.computed.reads('_stateManager.isPendingDelete'),

  init() {
    this._super(...arguments);
    set(this, '_stateManager', get(this, 'stateManagerClass').create({ source: this }));
  },

  edit() {
    get(this, '_stateManager').send('edit');
  },

  markForDelete() {
    get(this, '_stateManager').send('markForDelete');
  },

  forceDelete() {
    return get(this, '_stateManager').send('forceDelete');
  },

  markForSave() {
    get(this, '_stateManager').send('markForSave');
  },

  forceSave() {
    return get(this, '_stateManager').send('forceSave');
  },

  clear() {
    get(this, '_stateManager').send('clear');
  }
});
