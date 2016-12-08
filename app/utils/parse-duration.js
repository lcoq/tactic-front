import Ember from 'ember';

export default function parseDuration(string) {
  if (Ember.isEmpty(string) || string.match(/^\s+$/)) {
    return 0;
  }

  if (string.match(/^(\s*[0-9]+\s*[hms]\s*){1,3}$/)) {
    let hours, minutes, seconds;

    if (string.match(/h/)) {
      const hIndex = string.indexOf('h');
      hours = parseInt(string.substring(0, hIndex));
      string = string.substring(hIndex+1);
    } else {
      hours = 0;
    }

    if (string.match(/m/)) {
      const mIndex = string.indexOf('m');
      minutes = parseInt(string.substring(0, mIndex));
      string = string.substring(mIndex+1);
    } else {
      minutes = 0;
    }

    if (string.match(/s/)) {
      const sIndex = string.indexOf('s');
      seconds = parseInt(string.substring(0, sIndex));
    } else {
      seconds = 0;
    }

    return (hours * 60 * 60) + (minutes * 60) + seconds;
  }

  if (string.match(/^\s*[0-9]*\s*:?\s*[0-9]*\s*:?\s*[0-9]+\s*$/)) {
    const [ hoursString, minutesString, secondsString ] = string.split(':');
    const hours = parseInt(hoursString);
    const minutes = parseInt(minutesString || '0');
    const seconds = parseInt(secondsString || '0');
    return (hours * 60 * 60) + (minutes * 60) + seconds;
  }

  return null;
}
