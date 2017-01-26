import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Controller.extend({
  authentication: Ember.inject.service(),

  passwordByUserId: null,
  errorByUserId: null,

  setPasswordAndErrorByUserId: Ember.observer('model.[]', function() {
    const passwords = {};
    const errors = {};
    let userId;

    get(this, 'model').forEach(function(user) {
      userId = get(user, 'id');
      passwords[userId] = null;
      errors[userId] = false;
    });

    setProperties(this, { passwordByUserId: passwords, errorByUserId: errors });
  }),


  actions: {
    logIn(user) {
      const password = get(this, 'passwordByUserId.' + get(user, 'id'));
      get(this, 'store').createRecord('session', { user: user, password: password }).save()
        .then((session) => { return get(this, 'authentication').authenticate(session); })
        .then(() => { return this.transitionToRoute('index'); })
        .catch(() => {
          set(this, 'errorByUserId.' + get(user, 'id'), true);
        });
    },
    clearError(user) {
      set(this, 'errorByUserId.' + get(user, 'id'), false);
    }
  }
});
