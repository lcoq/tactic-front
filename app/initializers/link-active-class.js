import Ember from 'ember';

export function initialize(/* application */) {
  Ember.LinkComponent.reopen({
    activeClass: 'link-active'
  });
}

export default {
  name: 'link-active-class',
  initialize
};
