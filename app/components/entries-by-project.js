import Ember from 'ember';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['entry-group-list'],

  list: null,
  rounding: false,

  actions: {

    didUpdateEntry() {
      get(this, 'didUpdateEntry')(...arguments);
    },

    didDeleteEntry() {
      get(this, 'didDeleteEntry')(...arguments);
    },

    generateCSV(group) {
      let project = group.get('project');
      get(this, 'generateCSV')({ project });
    }
  }
});
