import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { set } = Ember;

moduleForComponent('show-entry', 'Integration | Component | show entry', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  set(this, 'entry', Ember.Object.extend(Ember.Evented).create());
  this.render(hbs`{{show-entry entry=entry}}`);
});
