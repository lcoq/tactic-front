import Ember from 'ember';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['entry-group-list'],

  list: null,

  actions: {

    didUpdateEntry(entry, changedAttributes) {
      if (changedAttributes.startedAt || changedAttributes.stoppedAt) {
        get(this, 'list').updateEntry(entry);
      }
      get(this, 'didUpdateEntry')(entry, changedAttributes);
    },

    didDeleteEntry(entry) {
      get(this, 'list').removeEntry(entry);
    }
  }
});
