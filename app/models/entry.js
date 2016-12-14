import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import config from '../config/environment';

const { get, set, setProperties } = Ember;

export default DS.Model.extend({
  title: DS.attr(),
  startedAt: DS.attr('date'),
  stoppedAt: DS.attr('date'),
  project: DS.belongsTo('project'),
  user: DS.belongsTo('user'),

  durationInSeconds: Ember.computed('startedAt', 'stoppedAt', function() {
    const startedAt = get(this, 'startedAt');
    const stoppedAt = get(this, 'stoppedAt');
    if (startedAt && stoppedAt) {
      return moment(stoppedAt).diff(startedAt, 'seconds');
    }
  }),

  belongsToUserWithId(userId) {
    return this.belongsTo('user').id() === userId;
  },

  /* save */

  saveTimer: null,
  isPending: Ember.computed.bool('saveTimer'),

  /* update */

  isEditing: false,

  updateToDate(date) {
    const startedAt = moment(get(this, 'startedAt'));
    const stoppedAt = moment(get(this, 'stoppedAt'));

    const newStartedAt = moment(date).hours(startedAt.hours()).minutes(startedAt.minutes()).seconds(startedAt.seconds());
    const newStoppedAt = moment(date).hours(stoppedAt.hours()).minutes(stoppedAt.minutes()).seconds(stoppedAt.seconds());

    if (newStartedAt.isAfter(newStoppedAt)) {
      newStoppedAt.add(1, 'day');
    }

    setProperties(this, {
      startedAt: newStartedAt.toDate(),
      stoppedAt: newStoppedAt.toDate()
    });
  },

  /* delete */

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  markForDelete() {
    const timer = Ember.run.later(this, this.deleteEntry, 3000);
    setProperties(this, { deleteTimer: timer, isEditing: false });
  },

  clearMarkForDelete() {
    const timer = get(this, 'deleteTimer');
    if (timer) {
      Ember.run.cancel(timer);
      set(this, 'deleteTimer', null);
    }
  },

  deleteEntry() {
    set(this, 'deleteTimer', null);
    return this.destroyRecord();
  },

  /* rollback */

  initialProject: null,

  updateInitialProject: Ember.on('didLoad', 'didUpdate', function() {
    set(this, 'initialProject', get(this, 'project'));
  }),

  rollbackProject() {
    set(this, 'project', get(this, 'initialProject'));
  },

  /* start & stop */

  durationTimer: null,
  isStarted: Ember.computed.bool('durationTimer'),

  start() {
    if (get(this, 'isStarted')) { return; }
    set(this, 'startedAt', new Date());
    this._updateDurationAndRestartTimer();
  },

  stop() {
    const timer = get(this, 'durationTimer');
    Ember.run.cancel(timer);
    setProperties(this, {
      durationTimer: null,
      stoppedAt: new Date()
    });
  },

  _updateDurationAndRestartTimer() {
    set(this, 'stoppedAt', new Date());
    if (config.environment === 'test') {
      // see https://github.com/emberjs/ember.js/issues/3008
      set(this, 'durationTimer', 12);
    } else {
      const timer = Ember.run.later(this, this._updateDurationAndRestartTimer, 500);
      set(this, 'durationTimer', timer);
    }
  }
});
