import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { set } = Ember;

moduleForComponent('show-client', 'Integration | Component | show client', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  set(this, 'client', Ember.Object.extend(Ember.Evented).create());
  this.render(hbs`{{show-client client=client}}`);
});
