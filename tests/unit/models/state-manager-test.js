import { moduleFor, test } from 'ember-qunit';

moduleFor('model:state-manager', 'Unit | Model | state manager', {
  unit: true,
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
