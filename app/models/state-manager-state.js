import Ember from 'ember';

const { get } = Ember;

export default Ember.Object.extend({
  source: null,
  manager: null,

  enter() { },
  leave() { },

  actions: { },

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
