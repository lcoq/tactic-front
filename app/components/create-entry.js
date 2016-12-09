import Ember from 'ember';
import config from '../config/environment';

const { get, set, setProperties } = Ember;

export default Ember.Component.extend({
  classNames: ['entry-create'],

  entry: null,
  timer: null,
  isStarted: Ember.computed.bool('timer'),

  projectName: null,
  projectNameChanged: Ember.observer('projectName', function() {
    if (!get(this, 'isStarted')) {
      this.send('startTimer');
    }
    Ember.run.debounce(this, this._searchProjects, 500);
  }),

  projectChoices: null,

  _searchProjects() {
    const query = get(this, 'projectName');
    get(this, 'searchProjects')(query).then((projects) => {
      set(this, 'projectChoices', projects);
    });
  },

  _updateDuration() {
    set(this, 'entry.stoppedAt', new Date());
    if (config.environment === 'test') {
      // see https://github.com/emberjs/ember.js/issues/3008
      set(this, 'timer', 12);
    } else {
      const timer = Ember.run.later(this, this._updateDuration, 500);
      set(this, 'timer', timer);
    }
  },

  actions: {
    startTimer() {
      if (get(this, 'isStarted')) { return; }
      set(this, 'entry.startedAt', new Date());
      this._updateDuration();
    },
    stopTimer() {
      const timer = get(this, 'timer');
      Ember.run.cancel(timer);
      setProperties(this, {
        timer: null,
        projectName: null,
        projectChoices: null
      });

      const entry = get(this, 'entry');
      set(entry, 'stoppedAt', new Date());

      get(this, 'saveEntry')();
    },
    selectProject(project) {
      const entry = get(this, 'entry');
      set(entry, 'project', project);
      setProperties(this, {
        'entry.project': project,
        projectChoices: null,
        projectName: get(project, 'name')
      });
    },
  }
});
