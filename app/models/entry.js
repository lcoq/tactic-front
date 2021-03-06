import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';
import EntryStateManager from './entry-state-manager';
import MutableRecordStateManagerMixin from '../mixins/mutable-record-state-manager-mixin';

const { get, set, setProperties } = Ember;

export default DS.Model.extend(MutableRecordStateManagerMixin, {
  title: DS.attr(),
  startedAt: DS.attr('date'),
  stoppedAt: DS.attr('date'),
  roundedStartedAt: DS.attr('date'),
  roundedStoppedAt: DS.attr('date'),
  roundedDuration: DS.attr('number'),
  project: DS.belongsTo('project'),
  user: DS.belongsTo('user'),
  stateManagerClass: EntryStateManager,

  durationInSeconds: Ember.computed('startedAt', 'stoppedAt', function() {
    const startedAt = get(this, 'startedAt');
    const stoppedAt = get(this, 'stoppedAt');
    if (startedAt && stoppedAt) {
      return moment(stoppedAt).diff(startedAt, 'seconds');
    }
  }),

  roundedDurationInSeconds: Ember.computed.alias('roundedDuration'),

  belongsToUserWithId(userId) {
    return this.belongsTo('user').id() === userId;
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

  /* rollback */

  initialProject: null,

  rollbackProject() {
    set(this, 'project', get(this, 'initialProject'));
  },

  updateInitialProject: Ember.on('didLoad', 'didUpdate', function() {
    get(this, 'project').then(() => {
      set(this, 'initialProject', get(this, 'project'));
    });
    set(this, 'initialProject', get(this, 'project'));
  }),

  projectHasChanged: Ember.computed('project', 'initialProject', function() {
    return get(this, 'project.id') !== get(this, 'initialProject.id');
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
  }
});
