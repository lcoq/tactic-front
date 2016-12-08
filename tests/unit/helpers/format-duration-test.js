import { formatDurationHelper } from 'tactic-front/helpers/format-duration';
import { module, test } from 'qunit';

module('Unit | Helper | format duration');

test('it formats duration with 1 argument', function(assert) {
  assert.equal(formatDurationHelper([ 5*60*60 + 54*60 + 1*15 ]), '05:54:15', 'should format more than an hour');
});

test('it formats duration with 2 arguments', function(assert) {
  assert.equal(formatDurationHelper([
    new Date(2016, 10, 25, 16, 44, 26),
    new Date(2016, 10, 25, 19, 59, 38)
  ]), '03:15:12', 'should format more than an hour');
});
