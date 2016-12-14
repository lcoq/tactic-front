import Ember from 'ember';

const { get } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['project', 'it-project'],
  classNameBindings: ['project.isEditing:editing', 'project.isDeleting:deleting', 'project.isPending:pending'],

  project: null,

  _didUpdateProject() {
    /* send action to controller */
  },

  _didDeleteProject() {
    /* send action to controller */
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
      get(this, 'project').startEdit();
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.$('.js-project-edit-name').focus();
      this._watchFocusOut();
      });
    },
    stopEditProject() {
      const project = get(this, 'project');
      project.stopEdit();
      project.one('didUpdate', this, this._didUpdateProject);
      this._unwatchFocusOut();
    },
    revertEditProject() {
      const project = get(this, 'project');
      project.cancelEdit();
      project.off('didUpdate', this, this._didUpdateProject);
    },

    /* delete */

    markProjectForDelete() {
      const project = get(this, 'project');
      project.markForDelete();
      project.one('didDelete', this, this._didDeleteProject);
    },
    cancelDeleteProject() {
      const project = get(this, 'project');
      project.clearMarkForDelete();
      project.off('didDelete', this, this._didDeleteProject);
    }
  }
});
