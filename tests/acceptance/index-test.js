import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

function logsIn(s) {
  const postSessionsData = [{ type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } }];
  s.post(url('sessions'), function() { return [ 200, {}, { data: postSessionsData }]; });

  const getUsersData = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  s.get(url('users'), function() { return [ 200, {}, { data: getUsersData }]; });

  visit('/login');
  click('.it-select-user');
}

function stubLogInModelRequest(s) {
  const data = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  s.get(url('users'), function() { return [ 200, {}, { data: data }]; });
}

let server;

moduleForAcceptance('Acceptance | index', {
  beforeEach() {
    server = setupServer();
  },
  afterEach() {
    teardownServer(server);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    server = null;
  }
});

test('redirects to login when not authentified', function(assert) {
  stubLogInModelRequest(server);
  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('redirects to login when a session token is stored in cookies but is invalid', function(assert) {
  document.cookie = "token=session-token; path=/";

  stubLogInModelRequest(server);
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

test('GET session and stay on index when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  const getSession = server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  visit('/');

  andThen(function() {
    assert.equal(getSession.numberOfCalls, 1, 'should GET session');
    assert.equal(currentURL(), '/', 'should stay on index');
  });
});

test('click on username goes to login', function(assert) {
  logsIn(server);
  click('.it-current-user');

  andThen(function() {
    assert.equal(currentURL(), '/login', 'should go to login');
  });
});
