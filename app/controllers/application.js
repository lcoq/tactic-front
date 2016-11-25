import Ember from 'ember';

export default Ember.Controller.extend({
  authentication: Ember.inject.service(),
  currentUser: Ember.computed.reads('authentication.user')
});
