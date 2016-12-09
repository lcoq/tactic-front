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

  deleteTimer: null,
  isDeleting: Ember.computed.bool('deleteTimer'),

  isEditing: false,

  saveTimer: null,
  isPending: Ember.computed.bool('saveTimer'),

  initialProject: null,

  updateInitialProject: Ember.on('didLoad', 'didUpdate', function() {
    set(this, 'initialProject', get(this, 'project'));
  }),

  rollbackProject() {
    set(this, 'project', get(this, 'initialProject'));
  },

  updateToDate(date) {
    const startedAt = moment(get(this, 'startedAt'));
    const stoppedAt = moment(get(this, 'stoppedAt'));

    const newStartedAt = moment(date).hours(startedAt.hours()).minutes(startedAt.minutes()).seconds(startedAt.seconds());
    const newStoppedAt = moment(date).hours(stoppedAt.hours()).minutes(stoppedAt.minutes()).seconds(stoppedAt.seconds());
    /* TODO when stopped at is the next day */

    setProperties(this, {
      startedAt: newStartedAt.toDate(),
      stoppedAt: newStoppedAt.toDate()
    });
  },

  durationInSeconds: Ember.computed('startedAt', 'stoppedAt', function() {
    const startedAt = get(this, 'startedAt');
    const stoppedAt = get(this, 'stoppedAt');
    if (startedAt && stoppedAt) {
      return moment(stoppedAt).diff(startedAt, 'seconds');
    }
  }),

  belongsToUserWithId(userId) {
    return this.belongsTo('user').id() === userId;
  }
});
