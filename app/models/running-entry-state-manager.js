import Ember from 'ember';
import StateManager from './state-manager';
import StateManagerState from './state-manager-state';

const { get, set } = Ember;

const State = StateManagerState.extend({
  entry: Ember.computed.alias('source')
});

const ClearState = State.extend({
  name: 'clear',
  isClear: true,

  actions: {
    start() {
      const entry = get(this, 'entry');
      entry.start();
    },
    stop() {
      const entry = get(this, 'entry');
      entry.stop();
    },
    update() {
      this._transitionTo('pendingSave');
    },
    save() {
      const entry = get(this, 'entry');
      return entry.save();
    }
  }
});

const PendingSaveState = State.extend({
  name: 'pendingSave',
  isPendingSave: true,

  saveTimer: null,

  enter() {
    this._startTimer();
  },

  leave() {
    this._cancelTimer();
  },

  actions: {
    forceSave() {
      this._cancelTimer();
      return this._save();
    },
    update() {
      this._cancelTimer();
      this._startTimer();
    },
    stop() {
      this._cancelTimer();
      get(this, 'entry').stop();
      this._transitionTo('clear');
    }
  },

  _save() {
    const entry = get(this, 'entry');
    return entry.save().then(() => {
      this._transitionTo('clear');
    });
  },

  _startTimer() {
    const timer = Ember.run.later(this, this._save, 3000);
    set(this, 'saveTimer', timer);
  },

  _cancelTimer() {
    const timer = get(this, 'saveTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'saveTimer', null);
    }
  }
});

export default StateManager.extend({
  entry: Ember.computed.alias('source'),

  isClear: Ember.computed.reads('currentState.isClear'),
  isPendingSave: Ember.computed.reads('currentState.isPendingSave'),

  stateClasses: [
    ClearState,
    PendingSaveState
  ]
});
