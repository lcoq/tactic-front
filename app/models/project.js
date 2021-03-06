import DS from 'ember-data';
import ProjectStateManager from './project-state-manager';
import MutableRecordStateManagerMixin from '../mixins/mutable-record-state-manager-mixin';

export default DS.Model.extend(MutableRecordStateManagerMixin, {
  name: DS.attr(),
  client: DS.belongsTo('client'),
  stateManagerClass: ProjectStateManager
});
