import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('entries-by-client-and-project', 'Integration | Component | entries by client and project', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  this.render(hbs`{{entries-by-client-and-project}}`);
});
