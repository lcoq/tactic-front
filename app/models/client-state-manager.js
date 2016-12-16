import Ember from 'ember';
import MutableRecordStateManager from './mutable-record-state-manager';

const { get } = Ember;

export default MutableRecordStateManager.extend({
  client: null,
  source: Ember.computed.alias('client'),

  checkValid(client) {
    return !Ember.isEmpty(get(client, 'name'));
  }
});
