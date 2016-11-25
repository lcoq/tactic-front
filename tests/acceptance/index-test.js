import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

function stubLoginRouteRequests(s) {
  const postSessionsData = [{ type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } }];
  s.post(url('sessions'), function() { return [ 200, {}, { data: postSessionsData }]; });

  const getUsersData = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  s.get(url('users'), function() { return [ 200, {}, { data: getUsersData }]; });
}

let server;

moduleForAcceptance('Acceptance | index', {
  beforeEach() {
    server = setupServer();
  },
  afterEach() {
    teardownServer(server);
    server = null;
  }
});

test('redirects to login when not authentified', function(assert) {
  const data = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  server.get(url('users'), function() { return [ 200, {}, { data: data }]; });

  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('click on username goes to login', function(assert) {
  stubLoginRouteRequests(server);
  visit('/login');
  click('.it-select-user');
  click('.it-current-user');

  andThen(function() {
    assert.equal(currentURL(), '/login', 'should go to login');
  });
});
