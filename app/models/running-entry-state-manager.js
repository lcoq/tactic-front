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
      this._transitionTo('pendingSave');
      return this.sendToCurrentState('forceSave');
    },
    stop() {
      const entry = get(this, 'entry');
      entry.stop();
      this._transitionTo('pendingSave');
      return this.sendToCurrentState('forceSave');
    },
    update() {
      this._transitionTo('pendingSave');
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
      return this._save();
    }
  },

  _savePromise: null,

  _save() {
    const entry = get(this, 'entry');
    const previousPromise = get(this, '_savePromise') || Ember.RSVP.resolve();
    const saveEntry = () => { return entry.save(); };
    const promise = previousPromise.then(saveEntry, saveEntry).then(() => {
      this._transitionTo('clear'); // TODO prevent transition clear -> clear ?
    }, () => {
      this._transitionTo('saveError');
      return Ember.RSVP.reject();
    });
    set(this, '_savePromise', promise);
    return promise;
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

const SaveErrorState = State.extend({
  name: 'saveError',
  isSaveErrored: true,

  actions: {
    retry() {
      this._transitionTo('pendingSave');
      return this.sendToCurrentState('forceSave');
    },
    update() {
      this._transitionTo('pendingSave');
    },
    stop() {
      const entry = get(this, 'entry');
      entry.stop();
      this._transitionTo('pendingSave');
      return this.sendToCurrentState('forceSave');
    }
  }
});

export default StateManager.extend({
  entry: Ember.computed.alias('source'),

  isClear: Ember.computed.reads('currentState.isClear'),
  isPendingSave: Ember.computed.reads('currentState.isPendingSave'),
  isSaveErrored: Ember.computed.reads('currentState.isSaveErrored'),

  stateClasses: [
    ClearState,
    PendingSaveState,
    SaveErrorState
  ]
});
