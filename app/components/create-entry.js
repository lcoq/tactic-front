import Ember from 'ember';

const { get, set, setProperties } = Ember;

export default Ember.Component.extend({
  classNames: ['entry-create'],

  entry: null,

  projectName: null,
  projectChoices: null,

  _searchProjects() {
    const query = get(this, 'projectName');
    get(this, 'searchProjects')(query).then((projects) => {
      set(this, 'projectChoices', projects);
    });
  },

  actions: {
    startTimer() {
      const entry = get(this, 'entry');
      get(this, 'startTimer')(entry);
    },
    stopTimer() {
      const entry = get(this, 'entry');
      get(this, 'stopTimer')(entry);
      setProperties(this, {
        projectChoices: null,
        projectName: null
      });
    },
    clearProjectIfEmpty() {
      if (Ember.isEmpty(get(this, 'projectName'))) {
        this.send('selectProject', null);
      }
    },
    projectNameChanged() {
      const entry = get(this, 'entry');
      get(this, 'startTimer')(entry);
      Ember.run.debounce(this, this._searchProjects, 500);
    },
    selectProject(project) {
      const entry = get(this, 'entry');
      get(this, 'selectProject')(entry, project);
      setProperties(this, {
        projectChoices: null,
        projectName: project ? get(project, 'name') : null
      });
    },
  }
});
