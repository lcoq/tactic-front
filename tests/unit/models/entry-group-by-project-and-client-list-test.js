import { moduleFor, test } from 'ember-qunit';

moduleFor('model:entry-group-by-project-and-client-list', 'Unit | Model | entry group by project and client list', {
  needs: ['model:entry-group-by-project-list', 'model:entry-group']
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
