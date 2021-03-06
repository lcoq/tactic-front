import Ember from 'ember';
import MutableRecordStateManager from './mutable-record-state-manager';

const { get } = Ember;

export default MutableRecordStateManager.extend({
  project: null,
  source: Ember.computed.alias('project'),

  checkValid(project) {
    return !Ember.isEmpty(get(project, 'name'));
  }
});
