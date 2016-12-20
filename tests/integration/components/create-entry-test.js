import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { set } = Ember;

moduleForComponent('create-entry', 'Integration | Component | create entry', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  set(this, 'entry', Ember.Object.create({ isStarted: false }));
  this.render(hbs`{{create-entry entry=entry}}`);
});
