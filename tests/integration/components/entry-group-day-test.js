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

test('it is yesterday', function(assert) {
  const day = moment().subtract(1, 'day').toDate();
  set(this, 'day', day);
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(/yesterday/i), 'should be yesterday');
});

test('it is the day and month when older than a week but in current year', function(assert) {
  const day = moment().subtract(10, 'days');
  set(this, 'day', day.toDate());
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(day.format("ddd[,] D MMM")), 'should be day and month');
  assert.notOk(this.$().text().match(day.format("YYYY")), 'should not have year');
});

test('is is the day and month when the day is in the future but in current year', function(assert) {
  const day = moment().add(1, 'day');
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

test('is is the day and month when the day is in the future but in next year', function(assert) {
  const day = moment().add(1, 'year');
  set(this, 'day', day.toDate());
  this.render(hbs`{{entry-group-day day}}`);
  assert.ok(this.$().text().match(day.format("ddd[,] D MMM YYYY")), 'should be day, month and year');
});
