import DS from 'ember-data';
import ClientStateManager from './client-state-manager';
import MutableRecordStateManagerMixin from '../mixins/mutable-record-state-manager-mixin';

export default DS.Model.extend(MutableRecordStateManagerMixin, {
  name: DS.attr(),
  projects: DS.hasMany('project'),
  stateManagerClass: ClientStateManager
});
