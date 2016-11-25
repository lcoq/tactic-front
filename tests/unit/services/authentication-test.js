import { moduleFor, test } from 'ember-qunit';

moduleFor('service:authentication', 'Unit | Service | authentication', {
  needs: ['service:cookie-store']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
