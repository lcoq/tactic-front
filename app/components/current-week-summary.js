import Ember from 'ember';
import EntryGroup from '../models/entry-group';

const { get } = Ember;

function filterEntriesByProject(entries, project) {
  const projectId = get(project, 'id') || null;
  return entries.filter(function(entry) {
    return entry.belongsTo('project').id() === projectId;
  });
}

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['header-nav-section'],

  authentication: Ember.inject.service(),
  currentWeek: Ember.inject.service(),

  currentUserId: Ember.computed.reads('authentication.userId'),

  currentUserIdChanged: Ember.observer('currentUserId', function() {
    get(this, 'currentWeek').reload();
  }),

  entriesByUser: Ember.computed('currentWeek.entries', function() {
    const currentUserId = get(this, 'currentUserId');

    const allEntries = (get(this, 'currentWeek.entries') || []);
    const allProjects = allEntries.mapBy('project').uniqBy('id');

    const userEntries = allEntries.filter(function(entry) {
      return entry.belongsToUserWithId(currentUserId);
    });

    const userProjectsGroup = [];
    const allProjectsGroup = [];

    allProjects.forEach(function(project) {
      userProjectsGroup.pushObject(EntryGroup.create({
        project: project,
        entries: filterEntriesByProject(userEntries, project)
      }));
      allProjectsGroup.pushObject(EntryGroup.create({
        project: project,
        entries: filterEntriesByProject(allEntries, project)
      }));
    });

    return [
      EntryGroup.create({ name: "Me", entries: userEntries, projectGroups: userProjectsGroup }),
      EntryGroup.create({ name: "Everyone", entries: allEntries, projectGroups: allProjectsGroup })
    ];
  }),

  init() {
    this._super(...arguments);
    get(this, 'currentWeek').start();
  }
});
