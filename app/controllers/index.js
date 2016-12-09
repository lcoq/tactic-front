import Ember from 'ember';
import moment from 'moment';
import EntryGroup from '../models/entry-group';

const { get, set } = Ember;

export default Ember.Controller.extend({
  currentWeek: Ember.inject.service(),

  newEntry: null,

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
  },



  _findGroupByEntry(groups, entry) {
    return groups.find(function(group) {
      return get(group, 'entries').includes(entry);
    });
  },

  _removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry) {
    if (get(group, 'entries.length') === 1) {
      groups.removeObject(group);
    } else {
      get(group, 'entries').removeObject(entry);
    }
  },

  _addEntryToEntriesByDay(entry) {
    const groups = get(this, 'entriesByDay');
    const day = moment(get(entry, 'startedAt')).startOf('day').toDate();
    const group = this._findGroup(groups, day) || this._createGroupAndInsertIn(groups, day);
    this._addEntry(group, entry);
  },

  _updateEntryOnEntriesByDay(entry) {
    const groups = get(this, 'entriesByDay');
    const day = moment(get(entry, 'startedAt')).startOf('day').toDate();

    const previousGroup = this._findGroupByEntry(groups, entry);
    const newGroup = this._findGroup(groups, day);

    if (previousGroup !== newGroup) {
      this._removeEntryFromGroupAndPossiblyWholeGroup(groups, previousGroup, entry);
      this._addEntryToEntriesByDay(entry);
    }
  },

  _removeEntryFromEntriesByDay(entry) {
    const groups = get(this, 'entriesByDay');
    const group = this._findGroupByEntry(groups, entry);
    this._removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry);
  },

  actions: {
    searchProjects(query) {
      return get(this, 'store').query('project', { filter: { query: query } });
    },
    buildNewEntry() {
      const entry = get(this, 'store').createRecord('entry');
      set(this, 'newEntry', entry);
    },
    saveNewEntry() {
      const entry = get(this, 'newEntry');
      entry.save().then(() => {
        this._addEntryToEntriesByDay(entry);
        get(this, 'currentWeek').reload();
        this.send('buildNewEntry');
      });
    },
    saveEntry(entry) {
      const changedAttributes = Object.keys(entry.changedAttributes());
      const dateChanged = changedAttributes.includes('startedAt') || changedAttributes.includes('stoppedAt');
      return entry.save().then(() => {
        get(this, 'currentWeek').reload();
        if (dateChanged) {
          this._updateEntryOnEntriesByDay(entry);
        }
      });
    },
    deleteEntry(entry) {
      entry.destroyRecord().then(() => {
        this._removeEntryFromEntriesByDay(entry);
        get(this, 'currentWeek').reload();
      });
    }
  }
});
