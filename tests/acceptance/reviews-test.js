import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import Ember from 'ember';

import { setupServer, teardownServer } from '../helpers/fake-server';
import defineRequestStubs from '../helpers/define-request-stubs';
import loginRouteStubs from '../helpers/login-route-stubs';
import currentWeekStubs from '../helpers/current-week-stubs';

let server;

moduleForAcceptance('Acceptance | reviews', {
  beforeEach() {
    server = setupServer();
  },
  afterEach() {
    teardownServer(server);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    server = null;
  }
});

test('redirects to login when not authenticated', function(assert) {
  defineRequestStubs(server, loginRouteStubs());

  visit('/reviews');
  andThen(function() {
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('redirects to login when a session token is stored in cookies but is invalid', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(loginRouteStubs(), {
    getSessions: {
      path: 'sessions',
      match(request) { return request.requestHeaders['Authorization'] === 'session-token'; },
      status: 403
    }
  }));

  visit('/reviews');

  andThen(function() {
    assert.equal(stubs.getSessions.requests.length, 1, 'should GET session');
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('send GET users, GET clients, GET projects, GET entries and display them when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(currentWeekStubs(), {
    getSessions: {
      path: 'sessions',
      match(request) { return request.requestHeaders['Authorization'] === 'session-token'; },
      body: {
        data: {
          type: 'sessions', id: '1',
          attributes: { token: 'session-token', name: 'louis' }
        }
      }
    },

    getUsers: {
      path: 'users',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: {
        data: [
          {
            type: 'users', id: '1',
            attributes: { name: 'louis' }
          }, {
            type: 'users', id: '2',
            attributes: { name: 'adrien' }
          }
        ]
      }
    },

    getClients: {
      path: 'clients',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: {
        data: [
          {
            type: 'clients', id: '1',
            attributes: { name: 'Productivity' }
          }
        ]
      }
    },

    getProjects: {
      path: 'projects',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: {
        data: [
          {
            type: 'projects', id: '1',
            attributes: { name: 'Tactic' },
            relationships: {
              client: {
                data: {
                  type: 'clients', id: '1'
                }
              }
            }
          }, {
            type: 'projects', id: '2',
            attributes: { name: 'Tictoc' }
          }, {
            type: 'projects', id: '3',
            attributes: { name: 'Toctoc' }
          }
        ]
      }
    },

    getEntries: {
      path: 'entries',
      match(request) {
        return Object.keys(request.queryParams).length === 4 &&
          request.queryParams['filter[user-id]'] && request.queryParams['filter[user-id]'].length === 2 &&
          request.queryParams['filter[project-id]'] && request.queryParams['filter[project-id]'].length === 4 &&
          request.queryParams['filter[since]'] &&
          request.queryParams['filter[before]'];
      },
      body: {
        data: [
          {
            type: 'entries', id: '1',
            attributes: {
              title: null,
              'started-at': "2016-11-25T13:01:11.000Z",
              'stopped-at': "2016-11-25T13:10:11.000Z"
            },
            relationships: {
              project: { data: { type: 'projects', id: '1' } }
            }
          }
        ]
      }
    }

  }));

  visit('/reviews');

  andThen(function() {
    assert.equal(currentURL(), '/reviews', 'should stay on reviews');

    assert.equal(stubs.getSessions.requests.length, 1, 'should GET sessions');
    assert.equal(stubs.getUsers.requests.length, 1, 'should GET users');
    assert.equal(stubs.getClients.requests.length, 1, 'should GET clients');
    assert.equal(stubs.getProjects.requests.length, 1, 'should GET projects');
    assert.equal(stubs.getEntries.requests.length, 1, 'should GET entries with user-id, project-id, since and before filters');

    assert.equal(find('.it-reviews-filter-item-user').length, 2, 'should display 2 users');
    assert.equal(find('.it-reviews-filter-item-client').length, 2, 'should display 2 clients (1 + "No client")');
    assert.equal(find('.it-reviews-filter-item-project').length, 4, 'should display 4 projects (3 + "No project")');
    assert.equal(find('.it-entry').length, 1, 'should show returned entry');
  });
});
