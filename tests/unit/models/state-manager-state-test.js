import { moduleFor, test } from 'ember-qunit';

moduleFor('model:state-manager-state', 'Unit | Model | state manager state', {
  unit: true,
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
