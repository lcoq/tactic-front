import Ember from 'ember';
import MutableRecordStateManager from 'tactic-front/models/mutable-record-state-manager';
import MutableRecordStateManagerMixin from 'tactic-front/mixins/mutable-record-state-manager-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | mutable record state manager mixin');

test('it works', function(assert) {
  let MutableRecordStateManagerMixinObject = Ember.Object.extend(MutableRecordStateManagerMixin);
  let subject = MutableRecordStateManagerMixinObject.create({
    stateManagerClass: MutableRecordStateManager
  });
  assert.ok(subject);
});
