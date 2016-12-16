import Ember from 'ember';

const { get, set } = Ember;

const Group = Ember.Object.extend({
  client: null,
  projects: null,

  init() {
    this._super(...arguments);
    set(this, 'projects', []);
  }
});

export default Ember.Object.extend({
  clients: null,
  projects: null,
  groups: null,

  addClient(client) {
    const groups = get(this, 'groups');
    this._createGroupAndInsertIn(groups, client);
    get(this, 'clients').pushObject(client);
  },

  removeClient(client) {
    const groups = get(this, 'groups');
    const group = this._findGroupByClient(groups, client);
    groups.removeObject(group);
    get(this, 'projects').removeObjects(get(group, 'projects'));
    get(this, 'clients').removeObject(client);
  },

  addProject(project) {
    const groups = get(this, 'groups');
    return get(project, 'client').then((client) => {
      const group = this._findGroupByClient(groups, client);
      get(group, 'projects').pushObject(project);
      get(this, 'projects').pushObject(project);
    });
  },

  removeProject(project) {
    const groups = get(this, 'groups');
    const group = this._findGroupByProject(groups, project);
    get(group, 'projects').removeObject(project);
    get(this, 'projects').removeObject(project);
  },

  findGroupByProject(project) {
    const groups = get(this, 'groups');
    return this._findGroupByProject(groups, project);
  },

  init() {
    this._super(...arguments);
    set(this, 'groups', this._buildGroupsFromClients());
  },

  _buildGroupsFromClients() {
    const groups = [];

    const clients = get(this, 'clients') || [];
    clients.forEach(function(client) {
      this._createGroupAndInsertIn(groups, client);
    }, this);

    const projects = get(this, 'projects') || [];
    projects.forEach(function(project) {
      const group = groups.find(function(g) { return get(g, 'client.id') === (get(project, 'client.id') || '0'); });
      get(group, 'projects').pushObject(project);
    });

    return groups;
  },


  _findGroupByClient(groups, client) {
    if (client) {
      return groups.find(function(g) { return get(g, 'client') === client; });
    } else {
      return groups.find(function(g) { return get(g, 'client.id') === '0'; });
    }
  },

  _findGroupByProject(groups, project) {
    return groups.find(function(g) {
      return get(g, 'projects').includes(project);
    });
  },


  _createGroupAndInsertIn(groups, client) {
    const group = Group.create({ client: client });
    groups.pushObject(group);
    return group;
  },

  _addProjects(group, projects) {
    get(group, 'projects').pushObjects(projects);
  }
});
