import Ember from 'ember';

const { get } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['client', 'it-client'],
  classNameBindings: [
    'client.isFrozen:frozen',
    'client.isEditing:editing',
    'client.isPendingDelete:deleting',
    'client.isPendingSave:pending',
    'client.isInvalid:invalid'
  ],

  client: null,

  isInvalidOrPendingSave: Ember.computed.or('client.isInvalid', 'client.isPendingSave'),

  didInsertElement() {
    this._super(...arguments);
    if (get(this, 'client.isEditing')) {
      this._onStartEdit();
    }
  },

  click() {
    const client = get(this, 'client');
    if (!get(client, 'isFrozen') && !get(client, 'isEditing')) {
      this.send('startEdit');
    }
  },

  _didDelete() {
    const client = get(this, 'client');
    get(this, 'didDelete')(client);
  },

  _onStartEdit() {
    get(this, 'client').off('didDelete', this, this._didDelete);

    Ember.run.scheduleOnce('afterRender', this, function() {
      this.$('.js-client-edit-name').focus();
      this._watchFocusOut();
    });
  },

  _watchFocusOut() {
    Ember.$('body').on('click.focus-out-client-edit-' + get(this, 'elementId'), (event) => {
      if (get(this, 'client.isEditing') && !elementIsOrIsIn(Ember.$(event.target), this.$())) {
        if (get(this, 'isDestroyed')) { return; }
        this.send('focusLost');
      }
    });
  },

  _unwatchFocusOut() {
    Ember.$('body').off('click.focus-out-client-edit-' + get(this, 'elementId'));
  },

  actions: {

    clearFocus() {
      Ember.$('body').click();
    },
    focusLost() {
      this.send('stopEdit');
    },

    /* edit */

    startEdit() {
      const client = get(this, 'client');
      get(this, 'startEdit')(client);
      this._onStartEdit();
    },
    stopEdit() {
      const client = get(this, 'client');
      get(this, 'stopEdit')(client);
      this._unwatchFocusOut();
    },
    revertEdit() {
      const client = get(this, 'client');
      get(this, 'cancelEdit')(client);
    },

    /* delete */

    markForDelete() {
      const client = get(this, 'client');
      get(this, 'markForDelete')(client);
      client.one('didDelete', this, this._didDelete);
    },
    cancelDelete() {
      const client = get(this, 'client');
      get(this, 'clearMarkForDelete')(client);
      client.off('didDelete', this, this._didDelete);
    }
  }
});