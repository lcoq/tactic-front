import { moduleFor, test } from 'ember-qunit';

moduleFor('model:entry-group-by-project-list', 'Unit | Model | entry group by project list', {
  unit: true,
  needs: ['model:entry-group']
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
