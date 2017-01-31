import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('entry-choose-project', 'Integration | Component | entry choose project', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  this.render(hbs`{{entry-choose-project}}`);
});
