import Ember from 'ember';
import EntryGroupByDayList from '../models/entry-group-by-day-list';
import moment from 'moment';

const { get, set } = Ember;

export default Ember.Controller.extend({
  entries: Ember.computed('selectedUsers.@each.id', 'selectedProjects.@each.id', 'since', 'before', function() {
    return get(this, 'store').query('entry', {
      filter: {
        'since': moment(get(this, 'since')).startOf('day').toISOString(),
        'before': moment(get(this, 'before')).endOf('day').toISOString(),
        'user-id': get(this, 'selectedUsers').mapBy('id'),
        'project-id': get(this, 'selectedProjects').mapBy('id')
      }
    });
  }),

  entriesByDay: Ember.computed('entries.[]', function() {
    const entries = get(this, 'entries');
    return EntryGroupByDayList.create({ entries: entries.toArray() });
  }),

  selectedUsersCheckboxes: Ember.computed('model.users', function() {
    const checkboxes = Ember.Object.create();
    get(this, 'model.users').forEach(function(user) {
      set(checkboxes, get(user, 'id'), true);
    });
    return checkboxes;
  }),

  selectedUsers: Ember.computed('model.users', 'selectedUsersCheckboxes', function() {
    const all = get(this, 'model.users');
    const checkboxes = get(this, 'selectedUsersCheckboxes');
    return all.filter(function(user) {
      return get(checkboxes, get(user, 'id'));
    });
  }),

  selectedProjectsCheckboxes: Ember.computed('model.projects', function() {
    const checkboxes = Ember.Object.create();
    get(this, 'model.projects').forEach(function(project) {
      set(checkboxes, get(project, 'id'), true);
    });
    return checkboxes;
  }),

  selectedProjects: Ember.computed('projects', 'selectedProjectsCheckboxes', function() {
    const all = get(this, 'model.projects');
    const checkboxes = get(this, 'selectedProjectsCheckboxes');
    return all.filter(function(project) {
      return get(checkboxes, get(project, 'id'));
    });
  }),

  since: Ember.computed(function() {
    return moment().startOf('month').hours(0).minutes(0).seconds(0).toDate();
  }),

  before: Ember.computed(function() {
    return moment().hours(0).minutes(0).seconds(0).toDate();
  }),

  _initDatePicker(selector, initialDate, onSelect) {
    Ember.$(selector).show();
    Ember.$(selector).datepicker({
      firstDay: 1,
      dateFormat: 'yymmdd',
      prevText: '<',
      nextText: '>',
      onSelect: function(dateString) {
        const date = moment(dateString, 'YYYYMMDD').toDate();
        onSelect(date);
      }
    });
    Ember.$(selector).datepicker('setDate', initialDate);
  },

  actions: {
    selectedUsersChanged(user) {
      const checkboxes = get(this, 'selectedUsersCheckboxes');
      const userId = get(user, 'id');
      set(checkboxes, userId, !get(checkboxes, userId));

      Ember.$('.js-reviews-filter-users').one('mouseleave', () => {
        this.notifyPropertyChange('selectedUsers');
      });
    },
    selectedProjectsChanged(project) {
      const checkboxes = get(this, 'selectedProjectsCheckboxes');
      const projectId = get(project, 'id');
      set(checkboxes, projectId, !get(checkboxes, projectId));

      Ember.$('.js-reviews-filter-projects').one('mouseleave', () => {
        this.notifyPropertyChange('selectedProjects');
      });
    },
    changeSinceDate() {
      this._initDatePicker('.js-since-datepicker', get(this, 'since'), (date) => {
        set(this, 'since', date);
        Ember.$('.js-since-datepicker').hide().datepicker('destroy');
      });
    },
    changeBeforeDate() {
      this._initDatePicker('.js-before-datepicker', get(this, 'before'), (date) => {
        set(this, 'before', date);
        Ember.$('.js-before-datepicker').hide().datepicker('destroy');
      });
    }
  }
});
