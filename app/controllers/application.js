import Ember from 'ember';

export default Ember.Controller.extend({
  authentication: Ember.inject.service(),
  isAuthenticated: Ember.computed.reads('authentication.isAuthenticated'),
  currentUserName: Ember.computed.reads('authentication.sessionName')
});
