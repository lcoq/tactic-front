import { moduleFor, test } from 'ember-qunit';

moduleFor('model:entry-group-by-client-and-project-list', 'Unit | Model | entry group by project and client list', {
  unit: true,
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
