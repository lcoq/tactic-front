import Ember from 'ember';
import moment from 'moment';
import EntryGroup from './entry-group';

const { get, set } = Ember;

export default Ember.Object.extend({
  entries: null,
  groups: null,

  addEntry(entry) {
    const groups = get(this, 'groups');
    this._addEntryAndPossiblyCreateGroup(groups, entry);
  },

  removeEntry(entry) {
    const groups = get(this, 'groups');
    const group = this._findGroupByEntry(groups, entry);
    this._removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry);
  },

  updateEntry(entry) {
    const groups = get(this, 'groups');
    const day = this._entryDay(entry);
    const previousGroup = this._findGroupByEntry(groups, entry);
    const newGroup = this._findGroup(groups, day);
    if (previousGroup !== newGroup) {
      this._removeEntryFromGroupAndPossiblyWholeGroup(groups, previousGroup, entry);
      this.addEntry(entry);
    }
  },

  init() {
    this._super(...arguments);
    set(this, 'groups', this._buildGroupsFromEntries());
  },

  _buildGroupsFromEntries() {
    const entries = get(this, 'entries') || [];
    const groups = [];
    entries.forEach(function(entry) {
      this._addEntryAndPossiblyCreateGroup(groups, entry);
    }, this);
    return groups;
  },


  _addEntryAndPossiblyCreateGroup(groups, entry) {
    const day = this._entryDay(entry);
    const group = this._findGroup(groups, day) || this._createGroupAndInsertIn(groups, day);
    this._addEntry(group, entry);
  },

  _addEntry(group, entry) {
    const entries = get(group, 'entries');
    entries.insertAt(this._entryInsertIndex(entries, entry), entry);
  },

  _removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry) {
    if (get(group, 'entries.length') === 1) {
      groups.removeObject(group);
    } else {
      get(group, 'entries').removeObject(entry);
    }
  },


  _findGroup(groups, day) {
    const momentDay = moment(day);
    return groups.find(function(d) {
      return momentDay.isSame(get(d, 'day'));
    });
  },

  _findGroupByEntry(groups, entry) {
    return groups.find(function(group) {
      return get(group, 'entries').includes(entry);
    });
  },


  _createGroupAndInsertIn(groups, day) {
    const group = EntryGroup.create({ day: day });
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
  },

  _entryDay(entry) {
    return moment(get(entry, 'startedAt')).startOf('day').toDate();
  }
});
