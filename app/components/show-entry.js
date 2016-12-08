import Ember from 'ember';

const { get, set, setProperties } = Ember;

function elementIsOrIsIn($element, $container) {
  return $element.is($container) || $element.closest($container).length;
}

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['entry', 'it-entry'],
  classNameBindings: ['isEditing:editing', 'isDeleting:deleting', 'isPending:pending'],
  entry: null,

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  saveTimer: null,
  isPending: Ember.computed.bool('saveTimer'),

  isEditing: false,

  /* use 'entry.project.name' dependent key triggers changes while the value remain the same */
  projectName: Ember.computed(function() { return get(this, 'entry.project.name'); }),
  entryProjectNameChanged: Ember.observer('entry.project.name', function() {
    const projectName = get(this, 'entry.project.name');
    if (get(this, 'projectName') !== projectName) {
      set(this, 'projectName', projectName);
    }
  }),

  projectNameChanged: Ember.observer('projectName', function() {
    Ember.run.debounce(this, this._searchProjects, 1000);
  }),

  projectChoices: null,

  didInsertElement() {
    this._super(...arguments);
    Ember.$('body').on('click.focus-out-entry-edit', (event) => {
      if (get(this, 'isEditing') && !elementIsOrIsIn(Ember.$(event.target), this.$())) {
        this.send('focusLost');
      }
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('body').off('click.focus-out-entry-edit');
  },

  _searchProjects() {
    if (!get(this, 'isEditing')) { return; }
    const query = get(this, 'projectName');
    get(this, 'searchProjects')(query).then((projects) => {
      set(this, 'projectChoices', projects);
    });
  },

  _revertChanges() {
    const entry = get(this, 'entry');
    entry.rollbackAttributes();
  },

  _cancelSaveAndDelete() {
    this._cancelDelete();
    this._cancelSave();
  },

  _cancelDelete() {
    const timer = get(this, 'deleteTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  },

  _cancelSave() {
    const timer = get(this, 'saveTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'saveTimer', null);
    }
  },

  _saveEntry() {
    set(this, 'saveTimer', null);
    const entry = get(this, 'entry');
    get(this, 'saveEntry')(entry);
  },

  _deleteEntry() {
    set(this, 'deleteTimer', null);
    const entry = get(this, 'entry');
    get(this, 'deleteEntry')(entry);
  },

  _closeEdit() {
    const timer = Ember.run.later(this, this._saveEntry, 5000);
    setProperties(this, {
      saveTimer: timer,
      isEditing: false,
      projectChoices: null
    });
  },

  actions: {
    clearFocus() {
      document.activeElement.blur();
    },
    focusLost() {
      this._closeEdit();
    },
    editEntry(selector) {
      if (get(this, 'isEditing')) { return; }
      this._cancelSaveAndDelete();
      set(this, 'isEditing', true);
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.$(selector).focus().select();
      });
    },
    selectProject(project) {
      this._closeEdit();
      get(this, 'entry').set('project', project);
    },
    revertEditEntry() {
      this._cancelSave();
      this._revertChanges();
    },
    deleteEntry() {
      const timer = Ember.run.later(this, this._deleteEntry, 5000);
      set(this, 'deleteTimer', timer);
    },
    revertDeleteEntry() {
      this._cancelDelete();
    }
  }
});
