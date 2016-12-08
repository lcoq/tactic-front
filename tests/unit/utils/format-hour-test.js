import formatHour from 'tactic-front/utils/format-hour';
import { module, test } from 'qunit';

module('Unit | Utility | format hour');

test('it works', function(assert) {
  assert.equal(formatHour(null, null));
  assert.equal(formatHour(new Date(2016,10,25,0,30)), "0:30");
  assert.equal(formatHour(new Date(2016,10,25,12,30)), "12:30");
  assert.equal(formatHour(new Date(2016,10,25,17,24)), "17:24");
});
