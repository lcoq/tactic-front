import Ember from 'ember';
import formatDuration from '../utils/format-duration';

export function formatDurationHelper(array) {
  return formatDuration(...array);
}

export default Ember.Helper.helper(formatDurationHelper);
