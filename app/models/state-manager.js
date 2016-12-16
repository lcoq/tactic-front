import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Object.extend({
  source: null,

  currentState: null,
  states: null,

  stateClasses: [],

  init() {
    this._super(...arguments);
    const states = this._initializeStates(get(this, 'stateClasses'));
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
    const source = get(this, 'source');
    return classes.map((klass) => {
      return klass.create({ manager: this, source: source });
    });
  }
});
