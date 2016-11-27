import Ember from 'ember';
import moment from 'moment';

const { get, set } = Ember;

const Group = Ember.Object.extend({
  day: null,
  entries: null,

  init() {
    this._super(...arguments);
    set(this, 'entries', []);
  },

  durationInSeconds: Ember.computed.sum('_entriesDurationsInSeconds'),
  _entriesDurationsInSeconds: Ember.computed.mapBy('entries', 'durationInSeconds')

});

export default Ember.Controller.extend({
  entriesByDay: Ember.computed('model', function() {
    const entries = get(this, 'model') || [];
    const groups = [];
    let day;
    let group;

    entries.forEach(function(entry) {
      day = moment(get(entry, 'startedAt')).startOf('day').toDate();
      group = this._findGroup(groups, day) || this._createGroupAndInsertIn(groups, day);
      this._addEntry(group, entry);
    }, this);

    return groups;
  }),

  _findGroup(groups, day) {
    const momentDay = moment(day);
    return groups.find(function(d) {
      return momentDay.isSame(get(d, 'day'));
    });
  },

  _createGroupAndInsertIn(groups, day) {
    const group = Group.create({ day: day });
    groups.insertAt(this._groupInsertIndex(groups, group), group);
    return group;
  },

  _groupInsertIndex(groups, group) {
    const momentDay = moment(get(group, 'day'));
    const nextGroup = groups.find(function(d) {
      return momentDay.isAfter(get(d, 'day'));
    });
    const index = groups.indexOf(nextGroup);
    if (index !== -1) {
      return index;
    } else {
      return get(groups, 'length');
    }
  },

  _addEntry(group, entry) {
    const entries = get(group, 'entries');
    entries.insertAt(this._entryInsertIndex(entries, entry), entry);
  },

  _entryInsertIndex(entries, entry) {
    const momentDate = moment(get(entry, 'startedAt'));
    const nextEntry = entries.find(function(e) {
      return momentDate.isAfter(get(e, 'startedAt'));
    });
    const index = entries.indexOf(nextEntry);
    if (index !== -1) {
      return index;
    } else {
      return get(entries, 'length');
    }
  }
});