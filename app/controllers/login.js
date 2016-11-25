import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({
  authentication: Ember.inject.service(),

  actions: {
    logIn(user) {
      get(this, 'authentication').authenticate(user).then(() => {
        this.transitionToRoute('index');
      });
    }
  }
});
