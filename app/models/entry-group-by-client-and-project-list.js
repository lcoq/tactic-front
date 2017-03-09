import Ember from 'ember';
import EntryGroupByProjectList from './entry-group-by-project-list';
import EntryGroup from './entry-group';

const { get, set } = Ember;

export default EntryGroup.extend({
  entries: null,
  groups: null,

  multipleGroups: Ember.computed.gt('groups.length', 1),

  removeEntry(entry) {
    const groups = get(this, 'groups');
    const group = this._findGroupByEntry(groups, entry);
    this._removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry);
    get(this, 'entries').removeObject(entry);
  },

  updateEntry(entry) {
    const groups = get(this, 'groups');
    const client = get(entry, 'project.client');
    const previousGroup = this._findGroupByEntry(groups, entry);
    const newGroup = this._findGroup(groups, client);
    if (previousGroup !== newGroup) {
      this._removeEntryFromGroupAndPossiblyWholeGroup(groups, previousGroup, entry);
      this._addEntryAndPossiblyCreateGroup(groups, entry);
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
    const client = get(entry, 'project.client');
    const group = this._findGroup(groups, client) || this._createGroupAndInsertIn(groups, client);
    this._addEntry(group, entry);
  },

  _addEntry(group, entry) {
    group.addEntry(entry);
  },

  _removeEntryFromGroupAndPossiblyWholeGroup(groups, group, entry) {
    if (get(group, 'entries.length') === 1) {
      groups.removeObject(group);
    } else {
      group.removeEntry(entry);
    }
  },



  _findGroup(groups, client) {
    if (client) {
      return groups.find(function(group) { return get(group, 'client.id') === get(client, 'id'); });
    } else {
      return groups.find(function(group) { return !get(group, 'client.id'); });
    }
  },

  _findGroupByEntry(groups, entry) {
    return groups.find(function(group) {
      return get(group, 'entries').includes(entry);
    });
  },


  _createGroupAndInsertIn(groups, client) {
    const group = EntryGroupByProjectList.create({ client: client });
    groups.insertAt(this._groupInsertIndex(groups, group), group);
    return group;
  },

  _groupInsertIndex(groups, group) {
    const clientName = get(group, 'client.name');
    if (!clientName) {
      return 0;
    }
    const nextGroup = groups.find(function(g) {
      return clientName < get(g, 'client.name');
    });
    const index = groups.indexOf(nextGroup);
    if (index !== -1) {
      return index;
    } else {
      return get(groups, 'length');
    }
  }
});
