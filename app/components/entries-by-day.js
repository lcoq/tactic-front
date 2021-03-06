import Ember from 'ember';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['entry-group-list'],

  list: null,

  actions: {

    didUpdateEntry(entry) {
      get(this, 'list').updateEntry(entry);
      get(this, 'didUpdateEntry')(entry);
    },

    didDeleteEntry(entry) {
      get(this, 'list').removeEntry(entry);
      get(this, 'didDeleteEntry')(entry);
    }
  }
});
