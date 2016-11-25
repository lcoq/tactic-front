import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
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
    assert.equal(currentURL(), '/login');
  });
});

test('click on username goes to login and send GET users again', function(assert) {
  const data = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  const getUsers = server.get(url('users'), function() { return [ 200, {}, { data: data }]; });

  visit('/login');
  click('.it-select-user');

  click('.it-current-user');

  andThen(function() {
    assert.equal(getUsers.numberOfCalls, 2, 'should have GET users twice');
    assert.equal(currentURL(), '/login');
  });
});
