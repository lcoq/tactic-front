import Ember from 'ember';
import moment from 'moment';

const { get, set } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['reviews-filters'],

  users: null,
  selectedUsers: null,
  projects: null,
  selectedProjects: null,
  since: null,
  before: null,

  selectedUsersCheckboxes: Ember.computed('users', function() {
    const checkboxes = Ember.Object.create();
    get(this, 'users').forEach(function(user) {
      set(checkboxes, get(user, 'id'), true);
    });
    return checkboxes;
  }),

  selectedProjectsCheckboxes: Ember.computed('projects', function() {
    const checkboxes = Ember.Object.create();
    get(this, 'projects').forEach(function(project) {
      set(checkboxes, get(project, 'id'), true);
    });
    return checkboxes;
  }),

  _initDatePicker(selector, initialDate, onSelect) {
    const $elt = this.$(selector);
    $elt.show();
    $elt.datepicker({
      firstDay: 1,
      dateFormat: 'yymmdd',
      prevText: '<',
      nextText: '>',
      onSelect: function(dateString) {
        const date = moment(dateString, 'YYYYMMDD').toDate();
        onSelect(date);
      }
    });
    $elt.datepicker('setDate', initialDate);
  },

  actions: {
    selectedUsersChanged(user) {
      const checkboxes = get(this, 'selectedUsersCheckboxes');
      const userId = get(user, 'id');
      set(checkboxes, userId, !get(checkboxes, userId));

      this.$('.js-reviews-filter-users').one('mouseleave', () => {
        const users = get(this, 'users');
        const selectedUsers = users.filter(function(user) { return get(checkboxes, get(user, 'id')); });
        set(this, 'selectedUsers', selectedUsers);
      });
    },
    selectedProjectsChanged(project) {
      const checkboxes = get(this, 'selectedProjectsCheckboxes');
      const projectId = get(project, 'id');
      set(checkboxes, projectId, !get(checkboxes, projectId));

      this.$('.js-reviews-filter-projects').one('mouseleave', () => {
        const projects = get(this, 'projects');
        const selectedProjects = projects.filter(function(project) { return get(checkboxes, get(project, 'id')); });
        set(this, 'selectedProjects', selectedProjects);
      });
    },
    changeSinceDate() {
      this._initDatePicker('.js-since-datepicker', get(this, 'since'), (date) => {
        set(this, 'since', date);
        this.$('.js-since-datepicker').hide().datepicker('destroy');
      });
    },
    changeBeforeDate() {
      this._initDatePicker('.js-before-datepicker', get(this, 'before'), (date) => {
        set(this, 'before', date);
        this.$('.js-before-datepicker').hide().datepicker('destroy');
      });
    }
  }
});
