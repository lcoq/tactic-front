import Ember from 'ember';
import EntryGroup from '../models/entry-group';

const { get } = Ember;

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['header-nav-section right header-user-summary-container'],

  userSummary: Ember.inject.service(),

  entryThisWeek: Ember.computed('userSummary.weekEntries', function() {
    const allEntries = (get(this, 'userSummary.weekEntries') || []);
    return EntryGroup.create({ name: 'current week entries', entries: allEntries });
  }),

  entryThisMonth: Ember.computed('userSummary.monthEntries', function() {
    const allEntries = (get(this, 'userSummary.monthEntries') || []);
    return EntryGroup.create({ name: 'current month entries :', entries: allEntries });
  }),  

  init() {
    this._super(...arguments);
    get(this, 'userSummary').start();
  }
});
