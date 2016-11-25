import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({
  authentication: Ember.inject.service(),

  actions: {
    logIn(user) {
      get(this, 'store').createRecord('session', { user: user }).save()
        .then((session) => { return get(this, 'authentication').authenticate(session); })
        .then(() => { return this.transitionToRoute('index'); });
    }
  }
});
