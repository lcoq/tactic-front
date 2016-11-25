import { moduleForModel, test } from 'ember-qunit';

moduleForModel('session', 'Unit | Model | session', {
  needs: ['model:user']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
