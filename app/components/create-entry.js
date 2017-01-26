import Ember from 'ember';
import formatDuration from '../utils/format-duration';
import config from '../config/environment';

const { get, set, setProperties } = Ember;

export default Ember.Component.extend({
  classNames: ['entry-create'],
  classNameBindings: ['stateManager.isSaveErrored:errored'],

  entry: null,
  stateManager: null,

  clock: Ember.computed(function() { return new Date(); }),
  clockTimer: null,

  entryDuration: Ember.computed('entry.startedAt', 'clock', function() {
    const startedAt = get(this, 'entry.startedAt');
    const clock = get(this, 'clock');
    return formatDuration(startedAt, clock);
  }),

  projectName: null,
  projectChoices: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const entry = get(this, 'entry');

    if (get(entry, 'isStarted')) {
      this._updateClockAndRestartTimer();
      get(entry, 'project').then((project) => {
        if (project) {
          set(this, 'projectName', get(project, 'name'));
        }
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.run.cancel(get(this, 'clockTimer'));
    set(this, 'clockTimer', null);
  },

  _searchProjects() {
    const query = get(this, 'projectName');
    get(this, 'searchProjects')(query).then((projects) => {
      set(this, 'projectChoices', projects);
    });
  },

  _updateClockAndRestartTimer() {
    this.notifyPropertyChange('clock');
    if (config.environment === 'test') {
      /* see https://github.com/emberjs/ember.js/issues/3008 */
      set(this, 'clockTimer', 12);
    } else {
      const timer = Ember.run.later(this, this._updateClockAndRestartTimer, 500);
      set(this, 'clockTimer', timer);
    }
  },

  actions: {
    startTimerOrTriggerUpdate() {
      const entry = get(this, 'entry');
      if (!get(entry, 'isStarted')) {
        this.send('startTimer');
      } else {
        get(this, 'didUpdateEntry')();
      }
    },
    startTimer() {
      if (get(this, 'entry.isStarted')) { return; }
      get(this, 'startTimer')();
      this._updateClockAndRestartTimer();
    },
    stopTimer() {
      Ember.run.cancel(get(this, 'clockTimer'));
      set(this, 'clockTimer', null);

      get(this, 'stopTimer')();
      setProperties(this, { projectChoices: null, projectName: null });
    },
    clearProjectIfEmpty() {
      if (Ember.isEmpty(get(this, 'projectName'))) {
        this.send('selectProject', null);
      }
    },
    projectNameChanged() {
      this.send('startTimer');
      Ember.run.debounce(this, this._searchProjects, 500);
    },
    selectProject(project) {
      const entry = get(this, 'entry');
      const projectName = project ? get(project, 'name') : null;
      set(entry, 'project', project);
      setProperties(this, { projectChoices: null, projectName: projectName });
      get(this, 'didUpdateEntry')();
    },
    retrySaveEntry() {
      get(this, 'retrySaveEntry')();
    }
  }
});
