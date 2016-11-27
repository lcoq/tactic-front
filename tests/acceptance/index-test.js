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

test('GET session, GET entries and display them grouped by day when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  const getSession = server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  const getEntriesData = [
    { type: 'entries', id: '1', attributes: { title: 'entry1', 'started-at': "2016-11-25T13:01:11.000Z", 'stopped-at': "2016-11-25T13:10:11.000Z" } },
    { type: 'entries', id: '2', attributes: { title: 'entry2', 'started-at': "2016-11-24T11:04:10.000Z", 'stopped-at': "2016-11-24T12:07:12.000Z" } },
    { type: 'entries', id: '3', attributes: { title: 'entry3', 'started-at': "2016-11-24T09:53:12.000Z", 'stopped-at': "2016-11-24T10:27:18.000Z" } }
  ];
  const getEntries = server.get(url('entries'), function() { return [ 200, {}, { data: getEntriesData }]; });

  visit('/');

  andThen(function() {
    assert.equal(getSession.numberOfCalls, 1, 'should GET session');
    assert.equal(getEntries.numberOfCalls, 1, 'should GET entries');
    assert.equal(currentURL(), '/', 'should stay on index');

    const $entryGroups = find('.it-entry-group');
    assert.equal($entryGroups.length, 2, 'should show 2 groups of entries');

    const $firstEntryGroup = $entryGroups.first();
    assert.equal($firstEntryGroup.find('.it-entry').length, 1, 'should show the first entry in the first entry group');
    assert.equal($firstEntryGroup.find('.it-entry-group-duration').text(), '00:09:00', 'should show the duration of the first entry group');

    const $secondEntryGroup = $entryGroups.last();
    assert.equal($secondEntryGroup.find('.it-entry').length, 2, 'should show the second and third entries in the second entry group');
    assert.ok($secondEntryGroup.find('.it-entry').first().text().match('entry2'), 'should show the second and third entries in the second entry group');
    assert.equal($secondEntryGroup.find('.it-entry-group-duration').text(), '01:37:08', 'should show the duration of the first entry group');
  });
});

test('click on username goes to login', function(assert) {
  logsIn(server);
  stubIndexModelRequest(server);
  click('.it-current-user');

  andThen(function() {
    assert.equal(currentURL(), '/login', 'should go to login');
  });
});
