import Ember from 'ember';
import moment from 'moment';

function pad(value, size) {
  let string = value.toFixed(0);
  while (string.length < size) { string = '0' + string; }
  return string;
}

export function formatDuration(array) {
  let hours;
  let minutes;
  let seconds;

  if (array.length === 2) {
    const [ startedAt, stoppedAt ] = array;
    if (!startedAt || !stoppedAt) { return; }
    hours = moment(stoppedAt).diff(startedAt, 'hours');
    minutes = moment(stoppedAt).diff(startedAt, 'minutes') % 60;
    seconds = moment(stoppedAt).diff(startedAt, 'seconds') % 60;
  } else {
    const [ durationInSeconds ] = array;
    if (!durationInSeconds && durationInSeconds !== 0) { return; }
    hours = Math.floor(durationInSeconds / (60 * 60));
    minutes = Math.floor((durationInSeconds / 60) % 60);
    seconds = Math.floor(durationInSeconds % 60);
  }

  return [
    pad(hours, 2),
    pad(minutes, 2),
    pad(seconds, 2)
  ].join(':');
}

export default Ember.Helper.helper(formatDuration);
