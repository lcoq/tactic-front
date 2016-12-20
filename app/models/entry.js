import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';

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

  saveEntry() {
    set(this, 'saveTimer', null);
    return this.save();
  },

  markForSave() {
    const timer = Ember.run.later(this, this.saveEntry, 3000);
    setProperties(this, { saveTimer: timer, isEditing: false });
  },

  clearMarkForSave() {
    this._clearTimer('saveTimer');
  },

  /* edit */

  isEditing: false,

  startEdit() {
    this.clearMarkForDelete();
    this.clearMarkForSave();
    set(this, 'isEditing', true);
  },

  stopEdit() {
    this.markForSave();
  },

  cancelEdit() {
    this.clearMarkForSave();
    this.rollbackAttributes();
    this._rollbackProject();
  },

  /* update */

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
    this._clearTimer('deleteTimer');
  },

  deleteEntry() {
    set(this, 'deleteTimer', null);
    return this.destroyRecord();
  },

  /* rollback */

  initialProject: null,

  _rollbackProject() {
    set(this, 'project', get(this, 'initialProject'));
  },

  updateInitialProject: Ember.on('didLoad', 'didUpdate', function() {
    const project = get(this, 'project');
    project.then(() => {
      set(this, 'initialProject', get(this, 'project'));
    });
  }),

  /* start & stop */

  isStarted: Ember.computed.and('startedAt', '_isNotStopped'),
  _isNotStopped: Ember.computed.not('stoppedAt'),

  start() {
    if (get(this, 'isStarted')) { return; }
    set(this, 'startedAt', new Date());
  },

  stop() {
    set(this, 'stoppedAt', new Date());
  },


  _clearTimer(propertyName) {
    const timer = get(this, propertyName);
    if (timer) {
      Ember.run.cancel(timer);
      set(this, propertyName, null);
    }
  }
});
