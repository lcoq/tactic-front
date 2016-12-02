import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';

const { get } = Ember;

export default DS.Model.extend({
  title: DS.attr(),
  startedAt: DS.attr('date'),
  stoppedAt: DS.attr('date'),
  project: DS.belongsTo('project'),

  durationInSeconds: Ember.computed('startedAt', 'stoppedAt', function() {
    const startedAt = get(this, 'startedAt');
    const stoppedAt = get(this, 'stoppedAt');
    if (startedAt && stoppedAt) {
      return moment(stoppedAt).diff(startedAt, 'seconds');
    }
  })
});
