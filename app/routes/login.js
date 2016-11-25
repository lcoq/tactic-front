import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  model() {
    return get(this, 'store').findAll('user');
  }
});
