import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

const { get, set, setProperties, run } = Ember;

moduleForModel('entry', 'Unit | Model | entry', {
  needs: [
    'model:project',
    'model:user'
  ]
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

test('roundedStartedAt rounds the started at down to a minute on the first minute', function(assert) {
  let model = this.subject();

  run(() => { set(model, 'startedAt', new Date(2017, 3, 4, 11, 50, 0)); });
  assert.deepEqual(get(model, 'roundedStartedAt'), new Date(2017, 3, 4, 11, 50, 0), "it keeps 50min");

  run(() => { set(model, 'startedAt', new Date(2017, 3, 4, 11, 50, 59)); });
  assert.deepEqual(get(model, 'roundedStartedAt'), new Date(2017, 3, 4, 11, 50, 0), "it rounds 50min59s to 50min");

  run(() => { set(model, 'startedAt', new Date(2017, 3, 4, 11, 55, 0)); });
  assert.deepEqual(get(model, 'roundedStartedAt'), new Date(2017, 3, 4, 11, 55, 0), "it keeps 55min");
});

test('roundedStartedAt rounds the started at up to 5 minutes after the first minute', function(assert) {
  let model = this.subject();

  run(() => { set(model, 'startedAt', new Date(2017, 3, 4, 11, 51, 0)); });
  assert.deepEqual(get(model, 'roundedStartedAt'), new Date(2017, 3, 4, 11, 55, 0), "it rounds 51min to 55min");

  run(() => { set(model, 'startedAt', new Date(2017, 3, 4, 11, 51, 1)); });
  assert.deepEqual(get(model, 'roundedStartedAt'), new Date(2017, 3, 4, 11, 55, 0), "it rounds 51min1s to 55min");

  run(() => { set(model, 'startedAt', new Date(2017, 3, 4, 11, 54, 59)); });
  assert.deepEqual(get(model, 'roundedStartedAt'), new Date(2017, 3, 4, 11, 55, 0), "it rounds 54min59s to 55min");
});

test('roundedDurationInSeconds rounds the duration down to a minute on the first minute', function(assert) {
  let model = this.subject();

  run(() => { set(model, 'durationInSeconds', 0); });
  assert.equal(get(model, 'roundedDurationInSeconds'), 0, "it keeps 0s");

  run(() => { set(model, 'durationInSeconds', 60 * 5); });
  assert.equal(get(model, 'roundedDurationInSeconds'), 60 * 5, "it keeps 5min");

  run(() => { set(model, 'durationInSeconds', 59); });
  assert.equal(get(model, 'roundedDurationInSeconds'), 0, "it rounds 59s to 0s");
});

test('roundedDurationInSeconds rounds the duration up to 5 5 minutes after the first minute', function(assert) {
  let model = this.subject();

  run(() => { set(model, 'durationInSeconds', 60); });
  assert.equal(get(model, 'roundedDurationInSeconds'), 60 * 5, "it rounds 1min to 5min");

  run(() => { set(model, 'durationInSeconds', 60 * 4 + 59); });
  assert.equal(get(model, 'roundedDurationInSeconds'), 60 * 5, "it rounds 4min59s to 5min");
});

test('roundedStoppedAt is computed with the rounded started at and duration', function(assert) {
  let model = this.subject();

  run(() => {
    setProperties(model, {
      startedAt: new Date(2017, 3, 4, 11, 51, 0),
      stoppedAt: new Date(2017, 3, 4, 11, 51, 59)
    });
  });
  assert.deepEqual(get(model, 'roundedStoppedAt'), new Date(2017, 3, 4, 11, 55, 0));

  run(() => {
    setProperties(model, {
      startedAt: new Date(2017, 3, 4, 11, 54, 0),
      stoppedAt: new Date(2017, 3, 4, 11, 59, 59)
    });
  });
  assert.deepEqual(get(model, 'roundedStoppedAt'), new Date(2017, 3, 4, 12, 0, 0));
});
