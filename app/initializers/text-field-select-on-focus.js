import Ember from 'ember';

const { get } = Ember;

export function initialize(/* application */) {
  Ember.TextField.reopen({
    focusIn() {
      if (get(this, 'selectOnFocus')) {
        this.$().select();
      }
      this._super(...arguments);
    }
  });
}

export default {
  name: 'text-field-select-on-focus',
  initialize
};
