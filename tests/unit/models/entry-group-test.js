import { moduleFor, test } from 'ember-qunit';

moduleFor('model:entry-group', 'Unit | Model | entry group', {
  unit: true,
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
