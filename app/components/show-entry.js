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
  classNameBindings: ['isEditing:editing', 'isDeleting:deleting', 'isPending:pending'],
  entry: null,

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  saveTimer: null,
  isPending: Ember.computed.bool('saveTimer'),

  isEditing: false,
  isEditingDate: false,

  initialProject: null,

  projectName: null,
  projectNameChanged: Ember.observer('projectName', function() {
    if (get(this, 'isEditing')) {
      Ember.run.debounce(this, this._searchProjects, 500);
    }
  }),

  formattedDuration: null,
  formattedDurationChanged: Ember.observer('formattedDuration', function() {
    const duration = parseDuration(get(this, 'formattedDuration'));
    if (duration && duration !== get(this, 'entry.durationInSeconds')) {
      const newStoppedAt = moment(get(this, 'entry.startedAt')).add(duration, 's').toDate();
      set(this, 'entry.stoppedAt', newStoppedAt);
    }
  }),

  formattedStartedAt: null,
  formattedStoppedAt: null,

  formattedStartedAtChanged: Ember.observer('formattedStartedAt', function() {
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
  }),

  formattedStoppedAtChanged: Ember.observer('formattedStoppedAt', function() {
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
  }),

  projectChoices: null,

  didInsertElement() {
    this._super(...arguments);
    this._updateInitialProject();
  },

  _searchProjects() {
    const query = get(this, 'projectName');
    if (!get(this, 'isEditing') || Ember.isEmpty(query)) { return; }
    get(this, 'searchProjects')(query).then((projects) => {
      set(this, 'projectChoices', projects);
    });
  },

  _revertChanges() {
    const entry = get(this, 'entry');
    entry.rollbackAttributes();
    entry.set('project', get(this, 'initialProject'));
  },

  _cancelSaveAndDelete() {
    this._cancelDelete();
    this._cancelSave();
  },

  _cancelDelete() {
    const timer = get(this, 'deleteTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  },

  _cancelSave() {
    const timer = get(this, 'saveTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'saveTimer', null);
    }
  },

  _saveEntry() {
    set(this, 'saveTimer', null);
    this.send('saveEntry');
  },

  _deleteEntry() {
    set(this, 'deleteTimer', null);
    const entry = get(this, 'entry');
    get(this, 'deleteEntry')(entry);
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
    set(this, 'isEditing', true);

    Ember.run.scheduleOnce('afterRender', this, function() {
      if (selector) {
        this.$(selector).focus();
      }
      this._watchFocusOut();
    });
  },

  _closeEdit() {
    const timer = Ember.run.later(this, this._saveEntry, 5000);
    setProperties(this, {
      saveTimer: timer,
      isEditing: false,
      isEditingDate: false
    });
    this._unwatchFocusOut();
  },

  _watchFocusOut() {
    Ember.$('body').on('click.focus-out-entry-edit', (event) => {
      if (get(this, 'isEditing') && !elementIsOrIsIn(Ember.$(event.target), this.$())) {
        this.send('focusLost');
      }
    });
  },

  _unwatchFocusOut() {
    Ember.$('body').off('click.focus-out-entry-edit');
  },

  _updateInitialProject() {
    set(this, 'initialProject', get(this, 'entry.project'));
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

  _updateDates(newDate) {
    const entry = get(this, 'entry');
    const startedAt = moment(get(entry, 'startedAt'));
    const stoppedAt = moment(get(entry, 'stoppedAt'));

    const newStartedAt = moment(newDate).hours(startedAt.hours()).minutes(startedAt.minutes()).seconds(startedAt.seconds());
    const newStoppedAt = moment(newDate).hours(stoppedAt.hours()).minutes(stoppedAt.minutes()).seconds(stoppedAt.seconds());
    /* TODO when stopped at is the next day */

    setProperties(entry, {
      startedAt: newStartedAt.toDate(),
      stoppedAt: newStoppedAt.toDate()
    });
  },

  actions: {
    clearFocus() {
      Ember.$('body').click();
    },
    clearFocusAndPossiblyProject() {
      if (Ember.isEmpty(get(this, 'projectName'))) {
        get(this, 'entry').set('project', null);
      }
      this.send('clearFocus');
    },
    focusLost() {
      this._closeEdit();
    },
    editEntry(selector) {
      if (get(this, 'isEditing')) { return; }
      this._cancelSaveAndDelete();
      this._openEdit(selector);
    },
    selectProject(project) {
      this._closeEdit();
      get(this, 'entry').set('project', project);
    },
    revertEditEntry() {
      this._cancelSave();
      this._revertChanges();
    },
    saveEntry() {
      const entry = get(this, 'entry');
      get(this, 'saveEntry')(entry).then(() => {
        this._updateInitialProject();
      });
    },
    deleteEntry() {
      const timer = Ember.run.later(this, this._deleteEntry, 5000);
      set(this, 'deleteTimer', timer);
    },
    revertDeleteEntry() {
      this._cancelDelete();
    },
    changeEntryDate() {
      if (get(this, 'isEditingDate')) {
        this._closeEdit();
        return;
      }
      if (!get(this, 'isEditing')) {
        this._openEdit();
      }
      set(this, 'isEditingDate', true);
      this._initDatePicker('.js-datepicker', get(this, 'entry.startedAt'), (date) => {
        this._updateDates(date);
        this._closeEdit();
      });
    }
  }
});
