import Ember from 'ember';
import config from '../config/environment';

export default function scheduleOnce(queue, self, callback) {
  if (config.environment === 'test') {
    return Ember.run.next(self, function() {
      return Ember.run.scheduleOnce(queue, self, callback);
    });
  } else {
    return Ember.run.scheduleOnce(queue, self, callback);
  }
}
