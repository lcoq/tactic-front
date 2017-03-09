import Ember from 'ember';
import moment from 'moment';
import scheduleOnce from '../utils/schedule-once';

const { get, set, setProperties } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

function allSelectedProperty(allProperty, selectedProperty) {
  return Ember.computed(allProperty, selectedProperty, function() {
    const total = get(this, allProperty + '.length');
    const selected = get(this, selectedProperty + '.length');
    return (total === selected);
  });
}

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
  allUsersSelected: allSelectedProperty('users', 'selectedUsers'),

  clients: null,
  selectedClients: null,
  allClientsSelected: allSelectedProperty('clients', 'selectedClients'),

  projects: null,
  selectedProjects: null,
  allProjectsSelected: allSelectedProperty('projects', 'selectedProjects'),

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

  _watchDatePickerFocusOut(datePickerSelector, datePickerContainerSelector, clickEventName) {
    Ember.run.next(this, function() {
      scheduleOnce('afterRender', this, function() {
        Ember.$(window).on(clickEventName, (event) => {
          const $element = Ember.$(event.target);
          if (!elementIsOrIsIn($element, datePickerContainerSelector) && !elementIsOrIsIn($element, '.ui-datepicker-header')) {
            this._closeDatePicker(datePickerSelector, clickEventName);
          }
        });
      });
    });
  },

  _closeDatePicker(datePickerSelector, clickEventName) {
    this.$(datePickerSelector).hide().datepicker('destroy');
    Ember.$(window).off(clickEventName);
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
      const clickEventName = 'click.focus-out-reviews-filter-since-datepicker';
      this._watchDatePickerFocusOut('.js-since-datepicker', '.js-reviews-filter-from', clickEventName);

      this._initDatePicker('.js-since-datepicker', get(this, 'since'), (date) => {
        const properties = { since: date };
        if (moment(date).isAfter(get(this, 'before'))) {
          properties.before = date;
        }
        setProperties(this, properties);
        this._closeDatePicker('.js-since-datepicker', clickEventName);
      });
    },
    changeBeforeDate() {
      const clickEventName = 'click.focus-out-reviews-filter-before-datepicker';
      this._watchDatePickerFocusOut('.js-before-datepicker', '.js-reviews-filter-to', clickEventName);

      this._initDatePicker('.js-before-datepicker', get(this, 'before'), (date) => {
        const properties = { before: date };
        if (moment(date).isBefore(get(this, 'since'))) {
          properties.since = date;
        }
        setProperties(this, properties);
        this._closeDatePicker('.js-before-datepicker', clickEventName);
      });
    },
    toggleRounding() {
      this.toggleProperty('rounding');
    }
  }
});
