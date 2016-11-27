import { formatDuration } from 'tactic-front/helpers/format-duration';
import { module, test } from 'qunit';

module('Unit | Helper | format duration');

test('it formats duration with 1 argument', function(assert) {
  assert.equal(formatDuration([ null ]), null, 'should format null');
  assert.equal(formatDuration([ 0 ]), '00:00:00', 'should format 0');
  assert.equal(formatDuration([ 15 ]), '00:00:15', 'should format less than a minute');
  assert.equal(formatDuration([ 54*60 + 1*15 ]), '00:54:15', 'should format less than an hour');
  assert.equal(formatDuration([ 5*60*60 + 54*60 + 1*15 ]), '05:54:15', 'should format more than an hour');
});

test('it formats duration with 2 arguments', function(assert) {
  assert.equal(formatDuration([
    null,
    null
  ]), null, 'should format with null started at and stopped at');

  assert.equal(formatDuration([
    new Date(2016, 10, 25, 19, 59, 26),
    null
  ]), null, 'should format with null stopped at');

  assert.equal(formatDuration([
    null,
    new Date(2016, 10, 25, 19, 59, 26)
  ]), null, 'should format with null started at');

  assert.equal(formatDuration([
    new Date(2016, 10, 25, 19, 59, 26),
    new Date(2016, 10, 25, 19, 59, 38)
  ]), '00:00:12', 'should format less than a minute');

  assert.equal(formatDuration([
    new Date(2016, 10, 25, 19, 44, 26),
    new Date(2016, 10, 25, 19, 59, 38)
  ]), '00:15:12', 'should format less than an hour');

  assert.equal(formatDuration([
    new Date(2016, 10, 25, 16, 44, 26),
    new Date(2016, 10, 25, 19, 59, 38)
  ]), '03:15:12', 'should format more than an hour');
});
