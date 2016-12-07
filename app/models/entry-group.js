import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Object.extend({
  entries: null,

  init() {
    this._super(...arguments);
    if (!get(this, 'entries')) {
      set(this, 'entries', []);
    }
  },

  durationInSeconds: Ember.computed.sum('_entriesDurationsInSeconds'),
  _entriesDurationsInSeconds: Ember.computed.mapBy('entries', 'durationInSeconds')
});
