import Ember from 'ember';
import scheduleOnce from '../utils/schedule-once';

const { get } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['project', 'it-project'],
  classNameBindings: [
    'project.isEditing:editing',
    'project.isPendingDelete:deleting',
    'project.isPendingSave:pending',
    'project.isInvalid:invalid',
    'project.isSaveErrored:errored',
    'project.isDeleteErrored:errored'
  ],

  project: null,
  deleteIsDisabled: false,

  deleteIsEnabled: Ember.computed.not('deleteIsDisabled'),

  canRevert: Ember.computed.or('project.isInvalid', 'project.isPendingSave'),
  isClearAndDeleteIsEnabled: Ember.computed.and('project.isClear', 'deleteIsEnabled'),

  didInsertElement() {
    this._super(...arguments);
    const project = get(this, 'project');
    project.one('didDelete', this, this._didDeleteProject);
    if (get(project, 'isEditing')) { this._onStartEdit(); }
  },

  willDestroyElement() {
    this._super(...arguments);
    const project = get(this, 'project');
    project.off('didDelete', this, this._didDeleteProject);
  },

  _didDeleteProject() {
    const project = get(this, 'project');
    get(this, 'didDeleteProject')(project);
  },

  _onStartEdit() {
    scheduleOnce('afterRender', this, function() {
      this.$('.js-project-edit-name').focus();
      this._watchFocusOut();
    });
  },

  _watchFocusOut() {
    Ember.$('body').on('click.focus-out-project-edit-' + get(this, 'elementId'), (event) => {
      if (get(this, 'project.isEditing') && !elementIsOrIsIn(Ember.$(event.target), this.$())) {
        if (get(this, 'isDestroyed')) { return; }
        this.send('focusLost');
      }
    });
  },

  _unwatchFocusOut() {
    Ember.$('body').off('click.focus-out-project-edit-' + get(this, 'elementId'));
  },

  actions: {

    clearFocus() {
      Ember.$('body').click();
    },
    focusLost() {
      this.send('stopEditProject');
    },

    /* edit */

    editProject() {
      const project = get(this, 'project');
      if (get(project, 'isEditing')) { return; }
      get(this, 'startEdit')(project);
      this._onStartEdit();
    },
    stopEditProject() {
      const project = get(this, 'project');
      get(this, 'stopEdit')(project);
      this._unwatchFocusOut();
    },
    revertEditProject() {
      const project = get(this, 'project');
      get(this, 'cancelEdit')(project);
    },

    /* delete */

    markProjectForDelete() {
      const project = get(this, 'project');
      get(this, 'markForDelete')(project);
    },
    cancelDeleteProject() {
      const project = get(this, 'project');
      get(this, 'clearMarkForDelete')(project);
    },

    /* retry */

    retrySaveProject() {
      const project = get(this, 'project');
      get(this, 'retrySave')(project);
    },

    retryDeleteProject() {
      const project = get(this, 'project');
      get(this, 'retryDelete')(project);
    }
  }
});
