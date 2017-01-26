import Ember from 'ember';
import scheduleOnce from '../utils/schedule-once';

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
    'client.isInvalid:invalid',
    'client.isSaveErrored:save-errored',
    'client.isDeleteErrored:delete-errored'
  ],

  client: null,

  canRevert: Ember.computed.or('client.isInvalid', 'client.isPendingSave'),

  didInsertElement() {
    this._super(...arguments);
    const client = get(this, 'client');
    client.one('didDelete', this, this._didDelete);
    if (get(client, 'isEditing')) { this._onStartEdit(); }
  },

  willDestroyElement() {
    this._super(...arguments);
    const client = get(this, 'client');
    client.off('didDelete', this, this._didDelete);
  },

  _didDelete() {
    const client = get(this, 'client');
    get(this, 'didDelete')(client);
  },

  _onStartEdit() {
    scheduleOnce('afterRender', this, function() {
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
      if (!get(client, 'isFrozen')) {
        get(this, 'startEdit')(client);
        this._onStartEdit();
      }
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
    },
    cancelDelete() {
      const client = get(this, 'client');
      get(this, 'clearMarkForDelete')(client);
    },

    /* retry */

    retrySave() {
      const client = get(this, 'client');
      get(this, 'retrySave')(client);
    },

    retryDelete() {
      const client = get(this, 'client');
      get(this, 'retryDelete')(client);
    }
  }
});
