import Ember from 'ember';
import currentWeekStubs from './current-week-stubs';

function getSessionsStub() {
  return {
    path: 'sessions',
    match(request) { return Object.keys(request.queryParams).length === 0; },
    body: {
      data: {
        type: 'sessions', id: '1',
        attributes: { token: 'session-token', name: 'louis' },
        relationships: {
          user: {
            data: {
              type: 'user', id: '1'
            }
          }
        }
      }
    }
  };
}

function runningEntryStub() {
  return {
    path: 'entries',
    match(request) { return request.queryParams['filter[running]'] === '1'; },
    body: { data: null }
  };
}

function getEntriesStub() {
  return {
    path: 'entries',
    match(request) { return Object.keys(request.queryParams).length === 1 && request.queryParams.include === 'project'; },
    body: { data: [] }
  };
}

export default function indexRouteStubs() {
  return Ember.merge(currentWeekStubs(), {
    getSessions: getSessionsStub(),
    getRunningEntry: runningEntryStub(),
    getEntries: getEntriesStub()
  });
}
