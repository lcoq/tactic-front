import Ember from 'ember';
import parseDuration  from '../utils/parse-duration';
import formatDuration from '../utils/format-duration';
import parseHour  from '../utils/parse-hour';
import formatHour from '../utils/format-hour';
import scheduleOnce from '../utils/schedule-once';
import moment from 'moment';

const { get, set, setProperties } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['entry', 'it-entry'],
  classNameBindings: [
    'entry.isEditing:editing',
    'entry.isPendingDelete:deleting',
    'entry.isPendingSave:pending',
    'entry.isSaveErrored:errored',
    'entry.isDeleteErrored:errored',
    'rounding:disabled'
  ],

  groupedBy: null,
  isGroupedByDay: Ember.computed.equal('groupedBy', 'day'),
  isGroupedByProject: Ember.computed.equal('groupedBy', 'project'),

  showDate: Ember.computed.not('isGroupedByDay'),

  entry: null,
  rounding: false,

  canRevert: Ember.computed.or('entry.isPendingSave', 'entry.isPendingDelete'),
  canRestartEntry: Ember.computed.and('restartEntry', 'entry.isClear'),

  isEditingDate: false,

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

  didInsertElement() {
    this._super(...arguments);
    const entry = get(this, 'entry');
    entry.one('didDelete', this, this._didDeleteEntry);
    entry.one('didCreate', this, this._didUpdateEntry);
    entry.one('didUpdate', this, this._didUpdateEntry);
  },

  willDestroyElement() {
    this._super(...arguments);
    const entry = get(this, 'entry');
    entry.off('didDelete', this, this._didDeleteEntry);
    entry.off('didCreate', this, this._didUpdateEntry);
    entry.off('didUpdate', this, this._didUpdateEntry);
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

    entry.edit();

    scheduleOnce('afterRender', this, function() {
      if (selector) { this.$(selector).focus(); }
    });

    Ember.run.next(this, function() {
      scheduleOnce('afterRender', this, function() { this._watchFocusOut(); });
    });
  },

  _closeEdit() {
    const entry = get(this, 'entry');
    if (get(this, 'willUpdateEntry')) {
      get(this, 'willUpdateEntry')(entry);
    }
    entry.markForSave();

    set(this, 'isEditingDate', false);

    this.$('.js-datepicker').datepicker('destroy');

    this.removeObserver('formattedStartedAt', this, this.formattedStartedAtChanged);
    this.removeObserver('formattedStoppedAt', this, this.formattedStoppedAtChanged);

    this._unwatchFocusOut();
  },

  _clickFocusesOut($element) {
    return get(this, 'entry.isEditing') &&
      !get(this, 'isDestroyed') &&
      !elementIsOrIsIn($element, this.$()) &&
      !elementIsOrIsIn($element, '.ui-datepicker-header');
  },

  _watchFocusOut() {
    Ember.$(window).on('click.focus-out-entry-edit-' + get(this, 'elementId'), (event) => {
      if (this._clickFocusesOut(Ember.$(event.target))) {
        this.send('focusLost');
      }
    });
  },

  _unwatchFocusOut() {
    Ember.$(window).off('click.focus-out-entry-edit-' + get(this, 'elementId'));
  },

  _initDatePicker(selector, initialDate, onSelect) {
    scheduleOnce('afterRender', this, function() {
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

  _didUpdateEntry() {
    const entry = get(this, 'entry');
    get(this, 'didUpdateEntry')(entry);
    entry.one('didUpdate', this, this._didUpdateEntry);
  },

  _didDeleteEntry() {
    const entry = get(this, 'entry');
    get(this, 'didDeleteEntry')(entry);
  },

  actions: {

    clearFocus() {
      Ember.$('body').click();
    },
    focusLost() {
      this._closeEdit();
    },

    /* edit */

    editEntry(selector) {
      if (get(this, 'entry.isEditing') || get(this, 'rounding')) { return; }
      this._openEdit(selector);
    },
    revertEditEntry() {
      const entry = get(this, 'entry');
      if (get(this, 'didRevertEntry')) {
        get(this, 'didRevertEntry')(entry);
      }
      entry.clear();
    },

    /* delete */

    markEntryForDelete() {
      const entry = get(this, 'entry');
      if (get(this, 'willDeleteEntry')) {
        get(this, 'willDeleteEntry')(entry);
      }
      entry.markForDelete();
    },

    /* retry */

    retrySaveOrDeleteEntry() {
      const entry = get(this, 'entry');
      entry.retry();
    },

    /* project */

    selectProject(project) {
      set(this, 'entry.project', project);
      this._closeEdit();
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
    },

    /* restart */

    restartEntry() {
      const entry = get(this, 'entry');
      get(this, 'restartEntry')(entry);
    }
  }
});
