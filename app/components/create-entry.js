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
      get(this, 'entry').start();
    },
    stopTimer() {
      const entry = get(this, 'entry');
      entry.stop();
      entry.save().then(() => { get(this, 'didCreateEntry')(entry); });
      setProperties(this, { projectChoices: null, projectName: null });
    },
    clearProjectIfEmpty() {
      if (Ember.isEmpty(get(this, 'projectName'))) {
        this.send('selectProject', null);
      }
    },
    projectNameChanged() {
      this.send('startTimer');
      Ember.run.debounce(this, this._searchProjects, 500);
    },
    selectProject(project) {
      setProperties(this, {
        'entry.project': project,
        projectChoices: null,
        projectName: project ? get(project, 'name') : null
      });
    },
  }
});
