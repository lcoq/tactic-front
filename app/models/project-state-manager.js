import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Object.extend({
  project: null,
  currentState: null,
  states: null,

  isClear: Ember.computed.reads('currentState.isClear'),
  isEditing: Ember.computed.reads('currentState.isEditing'),
  isInvalid: Ember.computed.reads('currentState.isInvalid'),
  isPendingSave: Ember.computed.reads('currentState.isPendingSave'),
  isPendingDelete: Ember.computed.reads('currentState.isPendingDelete'),

  init() {
    this._super(...arguments);
    const states = this._initializeStates([
      ClearState,
      EditingState,
      InvalidState,
      PendingSaveState,
      PendingDeleteState
    ]);
    setProperties(this, {
      states: states,
      currentState: states[0]
    });
  },

  send(actionName) {
    return get(this, 'currentState').send(actionName);
  },

  _transitionTo(stateName) {
    const currentState = get(this, 'currentState');
    const newState = get(this, 'states').findBy('name', stateName);
    currentState.leave();
    newState.enter();
    set(this, 'currentState', newState);
  },

  _initializeStates(classes) {
    const project = get(this, 'project');
    return classes.map((klass) => {
      return klass.create({ manager: this, project: project });
    });
  }
});


/* states */

const State = Ember.Object.extend({
  project: null,
  manager: null,

  enter: Ember.K,
  leave: Ember.K,

  send(actionName) {
    const action = this.actions[actionName];
    if (!action) {
      throw new Error("Action '" + actionName + "' not found on state '" + get(this, 'name') + "'");
    }
    return action.call(this);
  },

  _transitionTo(stateName) {
    this.manager._transitionTo(stateName);
  }
});

const ClearState = State.extend({
  name: 'clear',
  isClear: true,

  enter() {
    if (this._isDirty(this.project)) {
      this.project.rollbackAttributes();
    }
  },

  actions: {
    edit() {
      this._transitionTo('editing');
    },
    markForDelete() {
      this._transitionTo('pendingDelete');
    }
  },

  _isDirty(project) {
    return Object.keys(project.changedAttributes()).length !== 0;
  }
});

const EditingState = State.extend({
  name: 'editing',
  isEditing: true,

  actions: {
    markForSave() {
      if (this._isValid(this.project)) {
        this._transitionTo('pendingSave');
      } else {
        this._transitionTo('invalid');
      }
    }
  },

  _isValid(project) {
    return !Ember.isEmpty(get(project, 'name'));
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
    return this.project.save().then(() => {
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
    return this.project.destroyRecord().then(() => { this.send('clear'); });
  },

  _cancelTimer() {
    const timer = get(this, 'deleteTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  }
});
