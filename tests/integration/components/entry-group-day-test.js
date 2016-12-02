import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import moment from 'moment';

const { set } = Ember;

moduleForComponent('entry-group-day', 'Integration | Component | entry group day', {
  integration: true
});

test('it is today', function(assert) {
  const day = moment().toDate();
  set(this, 'day', day);
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(/today/i), 'should be today');
});

test('it is the number of days from now', function(assert) {
  const day = moment().subtract(2, 'days').toDate();
  set(this, 'day', day);
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(/2 days ago/i), 'should be 2 days ago');
});

test('it is the day and month when older than a week but in current year', function(assert) {
  const day = moment().subtract(10, 'days');
  set(this, 'day', day.toDate());
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(day.format("ddd[,] D MMM")), 'should be day and month');
  assert.notOk(this.$().text().match(day.format("YYYY")), 'should not have year');
});

test('it is the day, month and year when older a year', function(assert) {
  const day = moment().subtract(1, 'year');
  set(this, 'day', day.toDate());
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(day.format("ddd[,] D MMM YYYY")), 'should be day, month and year');
});
