import Ember from 'ember';
import parseDuration  from '../utils/parse-duration';
import formatDuration from '../utils/format-duration';
import parseHour  from '../utils/parse-hour';
import formatHour from '../utils/format-hour';
import moment from 'moment';

const { get, set, setProperties } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['entry', 'it-entry'],
  classNameBindings: ['entry.isEditing:editing', 'entry.isDeleting:deleting', 'entry.isPending:pending'],
  entry: null,

  isEditingDate: false,

  projectName: null,

  formattedDuration: null,
  formattedDurationChanged: Ember.observer('formattedDuration', function() {
    const duration = parseDuration(get(this, 'formattedDuration'));
    if (duration !== null && duration !== get(this, 'entry.durationInSeconds')) {
      const newStoppedAt = moment(get(this, 'entry.startedAt')).add(duration, 's').toDate();
      set(this, 'entry.stoppedAt', newStoppedAt);
    }
  }),

  formattedStartedAt: null,
  formattedStoppedAt: null,

  formattedStartedAtChanged: function() {
    const entry = get(this, 'entry');
    const entryStartedAt = get(entry, 'startedAt');

    const [ hours, minutes ] = parseHour(get(this, 'formattedStartedAt'));
    const newStartedAt = moment(entryStartedAt).hours(hours).minutes(minutes).toDate();
    const newStartedAtTime = newStartedAt.getTime();

    if (!isNaN(newStartedAtTime) && newStartedAtTime !== entryStartedAt.getTime()) {
      const stoppedAt = get(this, 'entry.stoppedAt');
      const properties = { startedAt: newStartedAt };
      if (moment(stoppedAt).isBefore(newStartedAt)) {
        properties.stoppedAt = newStartedAt;
      }
      setProperties(entry, properties);
    }
  },

  formattedStoppedAtChanged: function() {
    const entry = get(this, 'entry');
    const startedAt = get(entry, 'startedAt');

    const [ hours, minutes ] = parseHour(get(this, 'formattedStoppedAt'));
    let newStoppedAt = moment(startedAt).hours(hours).minutes(minutes).toDate();
    const newStoppedAtTime = newStoppedAt.getTime();

    if (!isNaN(newStoppedAtTime) && newStoppedAtTime !== get(entry, 'stoppedAt').getTime()) {
      if (moment(startedAt).isAfter(newStoppedAt)) {
        newStoppedAt = moment(newStoppedAt).add(1, 'day').toDate();
      }
      set(entry, 'stoppedAt', newStoppedAt);
    }
  },

  projectChoices: null,

  _searchProjects() {
    const query = get(this, 'projectName');
    if (!get(this, 'entry.isEditing')) { return; }
    get(this, 'searchProjects')(query).then((projects) => {
      set(this, 'projectChoices', projects);
    });
  },

  _openEdit(selector) {
    const entry = get(this, 'entry');

    setProperties(this, {
      projectName: get(entry, 'project.name'),
      formattedDuration: formatDuration(get(entry, 'durationInSeconds')),
      formattedStartedAt: formatHour(get(entry, 'startedAt')),
      formattedStoppedAt: formatHour(get(entry, 'stoppedAt')),
      projectChoices: null
    });

    this.addObserver('formattedStartedAt', this, this.formattedStartedAtChanged);
    this.addObserver('formattedStoppedAt', this, this.formattedStoppedAtChanged);

    get(this, 'editEntry')(entry);

    Ember.run.scheduleOnce('afterRender', this, function() {
      if (selector) { this.$(selector).focus(); }
      this._watchFocusOut();
    });
  },

  _closeEdit() {
    const entry = get(this, 'entry');
    get(this, 'stopEditEntry')(entry);
    set(this, 'isEditingDate', false);

    this.removeObserver('formattedStartedAt', this, this.formattedStartedAtChanged);
    this.removeObserver('formattedStoppedAt', this, this.formattedStoppedAtChanged);

    this._unwatchFocusOut();
  },

  _watchFocusOut() {
    Ember.$('body').on('click.focus-out-entry-edit-' + get(this, 'elementId'), (event) => {
      if (get(this, 'entry.isEditing') && !elementIsOrIsIn(Ember.$(event.target), this.$())) {
        if (get(this, 'isDestroyed')) { return; }
        this.send('focusLost');
      }
    });
  },

  _unwatchFocusOut() {
    Ember.$('body').off('click.focus-out-entry-edit-' + get(this, 'elementId'));
  },

  _initDatePicker(selector, initialDate, onSelect) {
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.$(selector).datepicker({
        firstDay: 1,
        dateFormat: 'yymmdd',
        prevText: '<',
        nextText: '>',
        onSelect: function(dateString) {
          const date = moment(dateString, 'YYYYMMDD').toDate();
          onSelect(date);
        }
      });
      this.$(selector).datepicker('setDate', initialDate);
    });
  },

  _didDeleteEntry() {
    const entry = get(this, 'entry');
    get(this, 'didDeleteEntry')(entry);
  },

  actions: {

    /* edit */

    editEntry(selector) {
      if (get(this, 'entry.isEditing')) { return; }
      this._openEdit(selector);
    },
    revertEditEntry() {
      const entry = get(this, 'entry');
      get(this, 'revertEditEntry')(entry);
    },

    /* delete */

    markEntryForDelete() {
      const entry = get(this, 'entry');
      entry.markForDelete();
      entry.one('didDelete', this, this._didDeleteEntry);
    },
    cancelDeleteEntry() {
      const entry = get(this, 'entry');
      entry.clearMarkForDelete();
      entry.off('didDelete', this, this._didDeleteEntry);
    },

    /* focus */

    clearFocus() {
      Ember.$('body').click();
    },
    focusLost() {
      this._closeEdit();
    },

    /* project */

    projectNameChanged() {
      Ember.run.debounce(this, this._searchProjects, 500);
    },

    clearProjectIfEmpty() {
      if (Ember.isEmpty(get(this, 'projectName'))) {
        this.send('selectProject', null);
      }
    },
    selectProject(project) {
      const entry = get(this, 'entry');
      get(this, 'selectProject')(entry, project);
      get(this, 'stopEditEntry')(entry);
    },

    /* date */

    changeEntryDate() {
      if (!get(this, 'entry.isEditing')) {
        this._openEdit();
      }
      set(this, 'isEditingDate', true);
      this._initDatePicker('.js-datepicker', get(this, 'entry.startedAt'), (date) => {
        get(this, 'entry').updateToDate(date);
        this._closeEdit();
      });
    }
  }
});
