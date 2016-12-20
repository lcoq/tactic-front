import Ember from 'ember';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['entry-group-list'],

  list: null,

  actions: {

    didUpdateEntry() {
      get(this, 'didUpdateEntry')(...arguments);
    },

    didDeleteEntry() {
      get(this, 'didDeleteEntry')(...arguments);
    }
  }
});
