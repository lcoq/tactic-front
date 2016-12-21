import Ember from 'ember';
import moment from 'moment';

const { get, set, setProperties } = Ember;

function checkboxesProperty(type) {
  return Ember.computed(type, function() {
    const collection = get(this, type);
    const selectedsProperty = Ember.String.camelize('selected_' + type);
    const selecteds = get(this, selectedsProperty);
    return createCheckboxes(collection, selecteds);
  });
}

function createCheckboxes(collection, selectedItems) {
  const checkboxes = Ember.Object.create();
  let isChecked;
  collection.forEach(function(item) {
    isChecked = selectedItems.find(function(i) {
      return get(i, 'id') === get(item, 'id');
    });
    set(checkboxes, get(item, 'id'), !!isChecked);
  });
  return checkboxes;
}

function changeAllCheck(checkboxes, check) {
  Object.keys(checkboxes).forEach(function(key) {
    set(checkboxes, key, check);
  });
}

function toggleCheck(checkboxes, item) {
  const id = get(item, 'id');
  set(checkboxes, id, !get(checkboxes, id));
}

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['reviews-filters'],

  users: null,
  selectedUsers: null,

  clients: null,
  selectedClients: null,

  projects: null,
  selectedProjects: null,

  since: null,
  before: null,

  selectedUsersCheckboxes: checkboxesProperty('users'),
  selectedClientsCheckboxes: checkboxesProperty('clients'),
  selectedProjectsCheckboxes: checkboxesProperty('projects'),


  _changeAllCheckAndUpdateSelecteds(type, check) {
    const checkboxesProperty = Ember.String.camelize('selected_' + type + '_checkboxes');
    const checkboxes = get(this, checkboxesProperty);
    changeAllCheck(checkboxes, check);
    this._updateSelectedsOnMouseLeave(type);
  },

  _toggleCheckAndUpdateSelectedsOnMouseLeave(type, item) {
    const checkboxesProperty = Ember.String.camelize('selected_' + type + '_checkboxes');
    const checkboxes = get(this, checkboxesProperty);
    toggleCheck(checkboxes, item);
    this._updateSelectedsOnMouseLeave(type);
  },

  _updateSelectedsOnMouseLeave(type) {
    const selector = '.js-reviews-filter-' + type;
    const checkboxesProperty = Ember.String.camelize('selected_' + type + '_checkboxes');
    const updateAction = Ember.String.camelize('update_selected_' + type);

    this.$(selector).off('mouseleave');
    this.$(selector).one('mouseleave', () => {
      const checkboxes = get(this, checkboxesProperty);
      const collection = get(this, type);
      const selectedItems = collection.filter(function(item) {
        return get(checkboxes, get(item, 'id'));
      });
      get(this, updateAction)(selectedItems);
    });
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
    checkAll(type) {
      this._changeAllCheckAndUpdateSelecteds(type, true);
    },
    uncheckAll(type) {
      this._changeAllCheckAndUpdateSelecteds(type, false);
    },
    selectedChanged(type, item) {
      this._toggleCheckAndUpdateSelectedsOnMouseLeave(type, item);
    },

    changeSinceDate() {
      this._initDatePicker('.js-since-datepicker', get(this, 'since'), (date) => {
        const properties = { since: date };
        if (moment(date).isAfter(get(this, 'before'))) {
          properties.before = date;
        }
        setProperties(this, properties);
        this.$('.js-since-datepicker').hide().datepicker('destroy');
      });
    },
    changeBeforeDate() {
      this._initDatePicker('.js-before-datepicker', get(this, 'before'), (date) => {
        const properties = { before: date };
        if (moment(date).isBefore(get(this, 'since'))) {
          properties.since = date;
        }
        setProperties(this, properties);
        this.$('.js-before-datepicker').hide().datepicker('destroy');
      });
    }
  }
});
