import Ember from 'ember';
import EntryGroup from './entry-group';
import moment from 'moment';

const { get, set } = Ember;

export default EntryGroup.extend({
  entries: null,
  groups: null,

  addEntry(entry) {
    const groups = get(this, 'groups');
    this._addEntryAndPossiblyCreateGroup(groups, entry);
    get(this, 'entries').pushObject(entry);
  },

  removeEntry(entry) {
    const groups = get(this, 'groups');
    const group = this._findGroupByEntry(groups, entry);
    this._removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry);
    get(this, 'entries').removeObject(entry);
  },

  updateEntry(entry) {
    const groups = get(this, 'groups');
    const project = get(entry, 'project');
    const previousGroup = this._findGroupByEntry(groups, entry);
    const newGroup = this._findGroup(groups, project);
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
    const project = get(entry, 'project');
    const group = this._findGroup(groups, project) || this._createGroupAndInsertIn(groups, project);
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


  _findGroup(groups, project) {
    return groups.find(function(group) {
      return get(group, 'project.id') === get(project, 'id');
    });
  },

  _findGroupByEntry(groups, entry) {
    return groups.find(function(group) {
      return get(group, 'entries').includes(entry);
    });
  },


  _createGroupAndInsertIn(groups, project) {
    const group = EntryGroup.create({ project: project });
    groups.insertAt(this._groupInsertIndex(groups, group), group);
    return group;
  },

  _groupInsertIndex(groups, group) {
    const projectName = get(group, 'project.name');
    const nextGroup = groups.find(function(g) {
      return projectName < get(g, 'project.name');
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
  }
});
