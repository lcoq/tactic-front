import Ember from 'ember';

const { get } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['project', 'it-project'],
  classNameBindings: [
    'project.isEditing:editing',
    'project.isDeleting:deleting',
    'project.isPending:pending',
    'project.isInvalid:invalid'
  ],

  project: null,

  didInsertElement() {
    this._super(...arguments);
    if (get(this, 'project.isEditing')) {
      this._onStartEdit();
    }
  },

  _didUpdateProject() {
    /* send action to controller */
  },

  _didDeleteProject() {
    const project = get(this, 'project');
    get(this, 'didDeleteProject')(project);
  },

  _onStartEdit() {
    Ember.run.scheduleOnce('afterRender', this, function() {
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
      get(this, 'startEdit')(project);
      this._onStartEdit();
    },
    stopEditProject() {
      const project = get(this, 'project');
      get(this, 'stopEdit')(project);
      project.one('didUpdate', this, this._didUpdateProject);
      this._unwatchFocusOut();
    },
    revertEditProject() {
      const project = get(this, 'project');
      get(this, 'cancelEdit')(project);
      project.off('didUpdate', this, this._didUpdateProject);
    },

    /* delete */

    markProjectForDelete() {
      const project = get(this, 'project');
      get(this, 'markForDelete')(project);
      project.one('didDelete', this, this._didDeleteProject);
    },
    cancelDeleteProject() {
      const project = get(this, 'project');
      project.clearMarkForDelete();
      project.off('didDelete', this, this._didDeleteProject);
    }
  }
});
