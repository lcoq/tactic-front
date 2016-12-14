import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('entries-by-day', 'Integration | Component | entries by day', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  this.render(hbs`{{entries-by-day}}`);
});
