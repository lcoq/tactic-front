import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

const { get } = Ember;

moduleForModel('entry', 'Unit | Model | entry', {
  needs: ['model:project']
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});

test('durationInSeconds with started at and stopped at', function(assert) {
  let model = this.subject({
    startedAt: new Date(2016, 10, 27, 9, 37, 12),
    stoppedAt: new Date(2016, 10, 27, 11, 54, 28)
  });
  assert.equal(get(model, 'durationInSeconds'), 2*3600 + 17*60 + 16);
});

test('durationInSeconds without started at', function(assert) {
  let model = this.subject({
    stoppedAt: new Date(2016, 10, 27, 11, 54, 28)
  });
  assert.equal(get(model, 'durationInSeconds'), null);
});

test('durationInSeconds without stopped at', function(assert) {
  let model = this.subject({
    startedAt: new Date(2016, 10, 27, 11, 54, 28)
  });
  assert.equal(get(model, 'durationInSeconds'), null);
});

test('durationInSeconds without started at and stopped at', function(assert) {
  let model = this.subject();
  assert.equal(get(model, 'durationInSeconds'), null);
});
