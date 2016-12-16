import { moduleFor, test } from 'ember-qunit';

moduleFor('model:mutable-record-state-manager', 'Unit | Model | mutable record state manager', {
  unit: true,
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
