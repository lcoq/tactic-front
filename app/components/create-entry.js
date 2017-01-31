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

  projectName: Ember.computed.reads('entry.project.name'),

  didReceiveAttrs() {
    this._super(...arguments);
    if (get(this, 'entry.isStarted')) {
      this._updateClockAndRestartTimer();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.run.cancel(get(this, 'clockTimer'));
    set(this, 'clockTimer', null);
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
      set(this, 'projectName', null);
    },
    selectProject(project) {
      setProperties(this, {
        'entry.project': project,
        'projectName': get(project, 'name')
      });
      get(this, 'didUpdateEntry')();
    },
    retrySaveEntry() {
      get(this, 'retrySaveEntry')();
    }
  }
});
