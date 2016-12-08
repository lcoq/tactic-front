import parseDuration from 'tactic-front/utils/parse-duration';
import { module, test } from 'qunit';

module('Unit | Utility | parse duration');

test('it parse valid X:X:X duration', function(assert) {
  assert.equal(parseDuration('00:00:00'), 0, 'should parse 00:00:00');
  assert.equal(parseDuration('00:00:59'), 59, 'should parse 00:00:59');
  assert.equal(parseDuration('00:59:59'), 59*60 + 59, 'should parse 00:59:59');
  assert.equal(parseDuration('99:59:59'), 99*60*60 + 59*60 + 59, 'should parse 99:59:59');

  assert.equal(parseDuration(' 99: 59: 59'), 99*60*60 + 59*60 + 59, 'should parse " 99: 59: 59"');
  assert.equal(parseDuration('99 :59 :59 '), 99*60*60 + 59*60 + 59, 'should parse "99 :59 :59 "');
  assert.equal(parseDuration(' 99 : 59 : 59 '), 99*60*60 + 59*60 + 59, 'should parse " 99 : 59 : 59 "');

  assert.equal(parseDuration('0:0:0'), 0, 'should parse 0:0:0');
  assert.equal(parseDuration('0:0:5'), 5, 'should parse 0:0:5');
  assert.equal(parseDuration('0:5:0'), 5*60, 'should parse 0:5:0');
  assert.equal(parseDuration('5:0:0'), 5*60*60, 'should parse 5:0:0');
  assert.equal(parseDuration('5:6:7'), 5*60*60 + 6*60 + 7, 'should parse 5:6:7');

  assert.equal(parseDuration('0:1'), 1*60, 'should parse 0:1');
  assert.equal(parseDuration('5:1'), 5*60*60 + 1*60, 'should parse 5:1');

  assert.equal(parseDuration('5'), 5*60*60, 'should parse 5');
});

test('it parse XhXmXs duration', function(assert) {
  assert.equal(parseDuration('1s'), 1, 'should parse 1s');
  assert.equal(parseDuration('1m'), 60, 'should parse 1m');
  assert.equal(parseDuration('1h'), 60*60, 'should parse 1h');

  assert.equal(parseDuration(' 1 s '), 1, 'should parse " 1s "');
  assert.equal(parseDuration(' 1 m '), 60, 'should parse " 1 m "');
  assert.equal(parseDuration(' 1 h '), 60*60, 'should parse " 1 h "');

  assert.equal(parseDuration('5m1s'), 5*60 + 1, 'should parse 5m1s');
  assert.equal(parseDuration('5h3m'), 5*60*60 + 3*60, 'should parse 5h3m');
  assert.equal(parseDuration('5h4s'), 5*60*60 + 4, 'should parse 5h4s');

  assert.equal(parseDuration('5m1'), 5*60 + 1, 'should parse 5m1');
  assert.equal(parseDuration('5h3'), 5*60*60 + 3*60, 'should parse 5h3');
  assert.equal(parseDuration('5h3m2'), 5*60*60 + 3*60 + 2, 'should parse 5h3m2');

  assert.equal(parseDuration(' 5 m 1 '), 5*60 + 1, 'should parse " 5 m 1 "');
  assert.equal(parseDuration(' 5 h 3 '), 5*60*60 + 3*60, 'should parse " 5 h 3 "');
  assert.equal(parseDuration(' 5 h 3 m 2 '), 5*60*60 + 3*60 + 2, 'should parse " 5 h 3 m 2 "');

  assert.equal(parseDuration('3h5m1s'), 3*60*60 + 5*60 + 1, 'should parse 3h5m1s');
});

test('it is 0 on empty duration', function(assert) {
  assert.equal(parseDuration(''), 0, 'should be 0 with empty string');
  assert.equal(parseDuration(' '), 0, 'should be 0 with string having only spaces');
});

test('it null on invalid duration', function(assert) {
  assert.equal(parseDuration('abc'), null, 'should be null with abc');
  assert.equal(parseDuration('123abc'), null, 'should be null with 123abc');
  assert.equal(parseDuration('123a:b:c'), null, 'should be null with 123a:b:c');
});
