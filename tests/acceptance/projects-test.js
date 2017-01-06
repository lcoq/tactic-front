import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import Ember from 'ember';

import { setupServer, teardownServer } from '../helpers/fake-server';
import defineRequestStubs from '../helpers/define-request-stubs';
import loginRouteStubs from '../helpers/login-route-stubs';
import userSummaryStubs from '../helpers/user-summary-stubs';

let server;

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

function projectsRouteStubs() {
  return {
    getSessions: getSessionsStub(),

    getProjects: {
      path: 'projects',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: { data: [] }
    },

    getClients: {
      path: 'clients',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: { data: [] }
    }
  };
}

moduleForAcceptance('Acceptance | projects', {
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

  visit('/projects');
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

  visit('/projects');

  andThen(function() {
    assert.equal(stubs.getSessions.requests.length, 1, 'should GET session');
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('GET clients, GET projects and display them when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(userSummaryStubs(), {
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

    getEntries: {
      path: 'entries',
      match() { return true; },
      body: { data: [] }
    },

    getProjects: {
      path: 'projects',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: {
        data: [
          { type: 'projects', id: '3',
            attributes: { name: 'Music' },
            relationships: { client: { data: null } }
          },
          {
            type: 'projects', id: '1',
            attributes: { name: 'Tactic' },
            relationships: { client: { data: { type: 'clients', id: '1' } } }
          },
          {
            type: 'projects', id: '2',
            attributes: { name: 'Tictoc' },
            relationships: { client: { data: { type: 'clients', id: '1' } } }
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
            type: 'clients', id: '2',
            attributes: { name: 'Efficiency' }
          },
          {
            type: 'clients', id: '1',
            attributes: { name: 'Productivity' },
            relationships: {
              projects: [
                { data: { type: 'projects', id: '1' } },
                { data: { type: 'projects', id: '2' } }
              ]
            }
          }
        ]
      }
    }

  }));


  /*

    No client
      Music
      + Create project
    Efficiency
      + Create project
    Productivity
      Tactic
      Tictoc
      + Create project
    + Create client

   */

  visit('/projects');

  andThen(function() {
    assert.equal(currentURL(), '/projects', 'should stay on projects');
    assert.equal(stubs.getProjects.requests.length, 1, 'should GET projects');
    assert.equal(stubs.getClients.requests.length, 1, 'should GET clients');
    assert.equal(find('.it-project').length, 6, 'should show 6 projects (Tactic,Tictoc, Music projects and 3 "Create new project"');
    assert.equal(find('.it-client').length, 4, 'should show 4 clients (Efficiency, Productivity clients, 1 "No client" and 1 "Create client"');
  });
});

test('create a project', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(Ember.merge(userSummaryStubs(), projectsRouteStubs()), {
    postProjects: {
      type: 'post',
      path: 'projects',
      match() { return true; },
      body: {
        data: {
          type: 'projects', id: '99',
          attributes: { name: 'Toctoc' }
        }
      }
    }
  }));

  visit('/projects');

  click('.it-project-create');

  andThen(function() {
    console.log('set val');
    Ember.$('.it-project-edit-name').focus().val("Toctoc").change().trigger('keyup');
    console.log('did set val');
  });

  click('.it-header');

  wait();

  andThen(function() {
    assert.equal(stubs.postProjects.requests.length, 1, 'should POST projects');
  });
});
