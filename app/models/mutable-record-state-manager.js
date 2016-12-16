import Ember from 'ember';
import StateManager from './state-manager';
import StateManagerState from './state-manager-state';

const { get, set } = Ember;

const State = StateManagerState;

const ClearState = State.extend({
  name: 'clear',
  isClear: true,

  enter() {
    const source = get(this, 'source');
    if (this.manager.checkDirty(source)) {
      source.rollbackAttributes();
    }
  },

  actions: {
    edit() {
      this._transitionTo('editing');
    },
    markForDelete() {
      this._transitionTo('pendingDelete');
    }
  }
});

const EditingState = State.extend({
  name: 'editing',
  isEditing: true,

  actions: {
    markForSave() {
      const source = get(this, 'source');
      if (this.manager.checkValid(source)) {
        this._transitionTo('pendingSave');
      } else {
        this._transitionTo('invalid');
      }
    }
  }
});

const InvalidState = State.extend({
  name: 'invalid',
  isInvalid: true,

  actions: {
    edit() {
      this._transitionTo('editing');
    },
    clear() {
      this._transitionTo('clear');
    }
  }
});

const PendingSaveState = State.extend({
  name: 'pendingSave',
  isPendingSave: true,

  saveTimer: null,

  enter() {
    const timer = Ember.run.later(this, this._save, 3000);
    set(this, 'saveTimer', timer);
  },

  leave() {
    this._cancelTimer();
  },

  actions: {
    forceSave() {
      this._cancelTimer();
      return this._save();
    },
    edit() {
      this._transitionTo('editing');
    },
    clear() {
      this._transitionTo('clear');
    }
  },

  _save() {
    set(this, 'saveTimer', null);
    return get(this, 'source').save().then(() => {
      this.send('clear');
    }, () => {
      this._transitionTo('invalid');
      return Ember.RSVP.reject();
    });
  },

  _cancelTimer() {
    const timer = get(this, 'saveTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'saveTimer', null);
    }
  }
});

const PendingDeleteState = State.extend({
  name: 'pendingDelete',
  isPendingDelete: true,

  deleteTimer: null,

  enter() {
    const timer = Ember.run.later(this, this._delete, 3000);
    set(this, 'deleteTimer', timer);
  },

  leave() {
    this._cancelTimer();
  },

  actions: {
    forceDelete() {
      this._cancelTimer();
      return this._delete();
    },
    edit() {
      this._transitionTo('editing');
    },
    clear() {
      this._transitionTo('clear');
    }
  },

  _delete() {
    set(this, 'deleteTimer', null);
    return get(this, 'source').destroyRecord().then(() => { this.send('clear'); });
  },

  _cancelTimer() {
    const timer = get(this, 'deleteTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  }
});

export default StateManager.extend({
  isClear: Ember.computed.reads('currentState.isClear'),
  isEditing: Ember.computed.reads('currentState.isEditing'),
  isInvalid: Ember.computed.reads('currentState.isInvalid'),
  isPendingSave: Ember.computed.reads('currentState.isPendingSave'),
  isPendingDelete: Ember.computed.reads('currentState.isPendingDelete'),

  stateClasses: [
    ClearState,
    EditingState,
    InvalidState,
    PendingSaveState,
    PendingDeleteState
  ],

  checkDirty(source) {
    return Object.keys(source.changedAttributes()).length !== 0;
  },

  checkValid() {
    return true;
  }
});
