import Ember from 'ember';
import MutableRecordStateManager from './mutable-record-state-manager';

const { get } = Ember;

export default MutableRecordStateManager.extend({
  entry: null,
  source: Ember.computed.alias('entry'),

  checkDirty(entry) {
    return this._super(...arguments) || get(entry, 'projectHasChanged');
  },

  rollback(entry) {
    this._super(...arguments);
    entry.rollbackProject();
  }
});
