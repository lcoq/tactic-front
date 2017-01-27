import Ember from 'ember';

const { get, set } = Ember;

const ENTER_KEY_CODE = 13;
const ARROW_UP_KEY_CODE = 38;
const ARROW_DOWN_KEY_CODE = 40;

export default Ember.Component.extend({
  classNamePrefix: "entry-edit",
  projectName: null,

  projects: null,

  hoveredProject: Ember.computed('projects', function() {
    return get(this, 'projects.firstObject');
  }),

  _searchProjects() {
    const query = get(this, 'projectName');
    get(this, 'searchProjects')(query).then((projects) => {
      if (get(this, 'isDestroying') || get(this, 'isDestroyed')) { return; }
      set(this, 'projects', projects);
    });
  },

  _changeHoveredProject(keyCode) {
    const projects = get(this, 'projects');
    if (Ember.isEmpty(projects)) { return; }
    const maxIndex = get(projects, 'length') - 1;
    let index = projects.indexOf(get(this, 'hoveredProject'));
    if (keyCode === ARROW_UP_KEY_CODE) {
      --index;
    } else {
      ++index;
    }
    if (index < 0) {
      index = maxIndex;
    } else if (index > maxIndex) {
      index = 0;
    }
    set(this, 'hoveredProject', projects.objectAt(index));
  },

  actions: {
    keyPressed(_, event) {
      if (event.which === ENTER_KEY_CODE) {
        this.send('selectOrClearIfEmpty');
      } else if (event.which === ARROW_UP_KEY_CODE || event.which === ARROW_DOWN_KEY_CODE) {
        this._changeHoveredProject(event.which);
      } else {
        const keyPressedAction = get(this, 'keyPressed');
        if (keyPressedAction) { keyPressedAction(); }
        Ember.run.debounce(this, this._searchProjects, 500);
      }
    },
    selectOrClearIfEmpty() {
      const project = Ember.isPresent(get(this, 'projectName')) ? get(this, 'hoveredProject') : null;
      this.send('selectProject', project);
    },
    selectProject(project) {
      get(this, 'selectProject')(project);
      set(this, 'projects', null);
    },
    changeHoveredProject(project) {
      set(this, 'hoveredProject', project);
    }
  }
});
