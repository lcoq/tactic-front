import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

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
  stubLoginModelRequest(server);
  visit('/reviews');
  andThen(function() {
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('redirects to login when a session token is stored in cookies but is invalid', function(assert) {
  document.cookie = "token=session-token; path=/";

  stubLoginModelRequest(server);
  const getSession = server.get(url('sessions'), function(request) {
    getSession.headers = request.requestHeaders;
    return [ 403, {}, {} ];
  });

  visit('/');

  andThen(function() {
    assert.equal(getSession.numberOfCalls, 1, 'should GET session');
    assert.equal(getSession.headers['Authorization'], 'session-token', 'should have send session token on Authorization header');
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('send GET users, GET projects, GET entries and display them when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  const getSession = server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  const getUsersData = [
    { type: 'users', id: '1', attributes: { name: 'louis' } },
    { type: 'users', id: '2', attributes: { name: 'adrien' } }
  ];
  const getUsers = server.get(url('users'), function() { return [ 200, {}, { data: getUsersData }]; });

  const getProjectsData = [
    { type: 'projects', id: '1', attributes: { name: 'Tactic' } },
    { type: 'projects', id: '2', attributes: { name: 'Tictoc' } },
    { type: 'projects', id: '3', attributes: { name: 'Toctoc' } }
  ];
  const getProjects = server.get(url('projects'), function() { return [ 200, {}, { data: getProjectsData }]; });

  const getEntriesData = [
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
  ];

  const getEntries = server.get(url('entries'), function(request) {
    if (!getEntries.requests) { getEntries.requests = []; }
    getEntries.requests.push(request);
    return [ 200, {}, { data: getEntriesData }];
  });

  visit('/reviews');

  andThen(function() {
    assert.equal(currentURL(), '/reviews', 'should stay on reviews');

    assert.equal(getSession.numberOfCalls, 1, 'should GET session');

    assert.equal(getUsers.numberOfCalls, 1, 'should GET users');
    assert.equal(find('.it-reviews-filter-item-user').length, 2, 'should display 2 users');

    assert.equal(getProjects.numberOfCalls, 1, 'should GET projects');
    assert.equal(find('.it-reviews-filter-item-project').length, 3, 'should display 3 projects');

    const getEntriesRequest = getEntries.requests.find(function(r) {
      const userIdFilter = r.queryParams['filter[user-id]'];
      const projectIdFilter = r.queryParams['filter[project-id]'];
      const sinceFilter = r.queryParams['filter[since]'];
      const beforeFilter = r.queryParams['filter[before]'];
      return userIdFilter && userIdFilter.length === 2 && projectIdFilter && projectIdFilter.length === 3 && sinceFilter && beforeFilter;
    });
    assert.ok(getEntriesRequest, 'should GET entries with user-id, project-id, since and before filters');
    assert.equal(find('.it-entry').length, 1, 'should show returned entry');
  });
});
