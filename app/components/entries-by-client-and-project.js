import Ember from 'ember';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['entry-root-group-list'],

  list: null,
  rounding: false,

  actions: {

    didUpdateEntry(entry) {
      get(this, 'list').updateEntry(entry);
      get(this, 'didUpdateEntry')(...arguments);
    },

    didDeleteEntry(entry) {
      get(this, 'list').removeEntry(entry);
      get(this, 'didDeleteEntry')(...arguments);
    },

    searchProjects() {
      return get(this, 'searchProjects')(...arguments);
    }
  }
});
