import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  authentication: Ember.inject.service(),

  beforeModel() {
    if (get(this, 'authentication.isRecoverable')) {
      return get(this, 'store').queryRecord('session', {}).then((session) => {
        return get(this, 'authentication').authenticate(session);
      }, () => {});
    }
  }
});
