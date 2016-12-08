import moment from 'moment';

export default function formatHour(date) {
  if (date) {
    return moment(date).format('H:mm');
  }
}
