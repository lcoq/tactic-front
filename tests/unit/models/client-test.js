import { moduleForModel, test } from 'ember-qunit';

moduleForModel('client', 'Unit | Model | client', {
  needs: ['model:project']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
