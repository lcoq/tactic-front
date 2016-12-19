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
    return this._createCheckboxes(get(this, 'users'), get(this, 'selectedUsers'));
  }),

  selectedProjectsCheckboxes: Ember.computed('projects', function() {
    return this._createCheckboxes(get(this, 'projects'), get(this, 'selectedProjects'));
  }),

  _updateSelectedUsersOnMouseLeave() {
    this.$('.js-reviews-filter-users').one('mouseleave', () => {
      const checkboxes = get(this, 'selectedUsersCheckboxes');
      const users = get(this, 'users');
      const selectedUsers = users.filter(function(user) { return get(checkboxes, get(user, 'id')); });
      set(this, 'selectedUsers', selectedUsers);
    });
  },

  _updateSelectedProjectsOnMouseLeave() {
    this.$('.js-reviews-filter-projects').one('mouseleave', () => {
      const checkboxes = get(this, 'selectedProjectsCheckboxes');
      const projects = get(this, 'projects');
      const selectedProjects = projects.filter(function(project) { return get(checkboxes, get(project, 'id')); });
      set(this, 'selectedProjects', selectedProjects);
    });
  },

  _createCheckboxes(collection, selectedItems) {
    const checkboxes = Ember.Object.create();
    let isChecked;
    collection.forEach(function(item) {
      isChecked = selectedItems.includes(item);
      set(checkboxes, get(item, 'id'), isChecked);
    });
    return checkboxes;
  },

  _checkAll(checkboxes) {
    Object.keys(checkboxes).forEach(function(key) { set(checkboxes, key, true); });
  },

  _uncheckAll(checkboxes) {
    Object.keys(checkboxes).forEach(function(key) { set(checkboxes, key, false); });
  },

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
    checkAllUsers() {
      this._checkAll(get(this, 'selectedUsersCheckboxes'));
      this._updateSelectedUsersOnMouseLeave();
    },
    uncheckAllUsers() {
      this._uncheckAll(get(this, 'selectedUsersCheckboxes'));
      this._updateSelectedUsersOnMouseLeave();
    },
    selectedUsersChanged(user) {
      const checkboxes = get(this, 'selectedUsersCheckboxes');
      const userId = get(user, 'id');
      set(checkboxes, userId, !get(checkboxes, userId));
      this._updateSelectedUsersOnMouseLeave();
    },
    checkAllProjects() {
      this._checkAll(get(this, 'selectedProjectsCheckboxes'));
      this._updateSelectedProjectsOnMouseLeave();
    },
    uncheckAllProjects() {
      this._uncheckAll(get(this, 'selectedProjectsCheckboxes'));
      this._updateSelectedProjectsOnMouseLeave();
    },
    selectedProjectsChanged(project) {
      const checkboxes = get(this, 'selectedProjectsCheckboxes');
      const projectId = get(project, 'id');
      set(checkboxes, projectId, !get(checkboxes, projectId));
      this._updateSelectedProjectsOnMouseLeave();
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
