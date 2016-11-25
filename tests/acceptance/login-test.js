import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

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
  const data = [
    { type: 'users', id: '1', attributes: { name: 'louis' } },
    { type: 'users', id: '2', attributes: { name: 'adrien' } }
  ];
  const getUsers = server.get(url('users'), function() { return [ 200, {}, { data: data }]; });

  visit('/login');

  andThen(function() {
    assert.equal(getUsers.numberOfCalls, 1, 'should have GET users');
    assert.equal(find('.it-select-user').length, 2, 'should display 2 users');
  });
});

test('logs in redirect to index and logs the user', function(assert) {
  const data = [{ type: 'users', id: '1', attributes: { name: 'louis' } }];
  server.get(url('users'), function() { return [ 200, {}, { data: data }]; });

  visit('/login');
  click('.it-select-user');

  andThen(function() {
    assert.equal(currentURL(), '/', 'should redirect to index');
    assert.ok(find('.it-current-user').text().match('louis'), 'should logs the user');
  });
});
