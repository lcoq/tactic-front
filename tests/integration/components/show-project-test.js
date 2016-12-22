import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { set } = Ember;

moduleForComponent('show-project', 'Integration | Component | show project', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(0);
  set(this, 'project', Ember.Object.extend(Ember.Evented).create());
  this.render(hbs`{{show-project project=project}}`);
});
