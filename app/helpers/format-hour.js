import Ember from 'ember';
import moment from 'moment';

export function formatHour([date]) {
  if (date) {
    return moment(date).format('H:mm');
  }
}

export default Ember.Helper.helper(formatHour);
