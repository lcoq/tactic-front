import parseHour from 'tactic-front/utils/parse-hour';
import { module, test } from 'qunit';

module('Unit | Utility | parse hour');

test('it parse X:X hours', function(assert) {
  assert.deepEqual(parseHour('9:52'), [9, 52], 'should parse 9:52');
  assert.deepEqual(parseHour('0:36'), [0, 36], 'should parse 0:36');
  assert.deepEqual(parseHour('0:0'), [0, 0], 'should parse 0:0');

  assert.deepEqual(parseHour(' 9 : 52 '), [9, 52], 'should parse " 9 : 52 "');
});

test('it parse X hours', function(assert) {
  assert.deepEqual(parseHour('10'), [10, 0], 'should parse 10');
  assert.deepEqual(parseHour(' 10 '), [10, 0], 'should parse " 10 "');
});
