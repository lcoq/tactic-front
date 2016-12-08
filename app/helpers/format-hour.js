import Ember from 'ember';
import formatHour from '../utils/format-hour';

export function formatHourHelper([date]) {
  return formatHour(date);
}

export default Ember.Helper.helper(formatHourHelper);
