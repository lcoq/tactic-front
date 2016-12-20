import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import Ember from 'ember';

import { setupServer, teardownServer } from '../helpers/fake-server';
import defineRequestStubs from '../helpers/define-request-stubs';
import indexRouteStubs from '../helpers/index-route-stubs';


let server;

moduleForAcceptance('Acceptance | login', {
  beforeEach() {
    server = setupServer();
  },
  afterEach() {
    teardownServer(server);
    server = null;
  }
});

test('send GET users and display them', function(assert) {
  const stubs = defineRequestStubs(server, {
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
    }
  });

  visit('/login');

  andThen(function() {
    assert.equal(stubs.getUsers.requests.length, 1, 'should have GET users');
    assert.equal(find('.it-select-user').length, 2, 'should display 2 users');
  });
});

test('logs in POST sessions and redirect to index', function(assert) {
  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {

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

    postSessions: {
      type: 'post',
      path: 'sessions',
      match(request) {
        const json = JSON.parse(request.requestBody);
        return json.data &&
          json.data.relationships &&
          json.data.relationships.user &&
          json.data.relationships.user.data &&
          json.data.relationships.user.data.id === '1';
      },
      body: {
        data: {
          type: 'sessions', id: '1',
          attributes: { token: 'session-token', name: 'louis' }
        }
      }
    }

  }));

  visit('/login');
  click('.it-select-user');

  andThen(function() {
    assert.equal(stubs.postSessions.requests.length, 1, 'should have POST sessions');
    assert.equal(currentURL(), '/', 'should redirect to index');
  });
});
