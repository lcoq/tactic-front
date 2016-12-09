import Ember from 'ember';
import moment from 'moment';

const { get } = Ember;

const EntryGroupDayComponent = Ember.Component.extend({
  day: null,

  formatted: Ember.computed('isToday', 'isCurrentWeek', 'isCurrentYear', function() {
    const day = moment(get(this, 'day')).hours(0).minutes(0).seconds(0);
    const today = moment().hours(0).minutes(0).seconds(0);
    const yesterday = moment(today.toDate()).subtract(1, 'day');

    if (day.isAfter(today, 'day')) {
      if (day.isSame(today, 'year')) {
        return day.format("ddd[,] D MMM");
      } else {
        return day.format("ddd[,] D MMM YYYY");
      }
    }

    if (day.isSame(today, 'day')) {     return "Today"; }
    if (day.isSame(yesterday, 'day')) { return "Yesterday"; }
    if (day.isSame(today, 'week')) {    return day.from(today); }
    if (day.isSame(today, 'year')) {    return day.format("ddd[,] D MMM"); }

    return day.format("ddd[,] D MMM YYYY");
  })
});

EntryGroupDayComponent.reopenClass({
  positionalParams: ['day']
});

export default EntryGroupDayComponent;
