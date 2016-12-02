import Ember from 'ember';
import moment from 'moment';

const { get } = Ember;

const EntryGroupDayComponent = Ember.Component.extend({
  day: null,

  isToday: Ember.computed('day', function() {
    const day = get(this, 'day');
    return moment().isSame(day, 'day');
  }),

  isCurrentWeek: Ember.computed('day', function() {
    const day = get(this, 'day');
    return moment().isSame(day, 'week');
  }),

  isCurrentYear: Ember.computed('day', function() {
    const day = get(this, 'day');
    return moment().isSame(day, 'year');
  })
});

EntryGroupDayComponent.reopenClass({
  positionalParams: ['day']
});

export default EntryGroupDayComponent;
