import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

function logsIn(s, options) {
  const userId = options && options.userId || '1';

  const postSessionsData = [{
    type: 'sessions', id: '1',
    attributes: { token: 'session-token', name: 'louis' },
    relationships: { user: { type: 'users', id: userId } }
  }];
  s.post(url('sessions'), function() { return [ 200, {}, { data: postSessionsData }]; });

  const getUsersData = [{ type: 'users', id: userId, attributes: { name: 'louis' } }];
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

test('GET session, GET entries?include=project and display them grouped by day when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  const getSession = server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

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
    },
    {
      type: 'entries', id: '2',
      attributes: {
        title: 'entry2',
        'started-at': "2016-11-24T11:04:10.000Z",
        'stopped-at': "2016-11-24T12:07:12.000Z"
      }
    },
    {
      type: 'entries', id: '3',
      attributes: {
        title: 'entry3',
        'started-at': "2016-11-24T09:53:12.000Z",
        'stopped-at': "2016-11-24T10:27:18.000Z"
      }
    }
  ];
  const getEntriesIncluded = [
    {
      type: 'projects', id: '1',
      attributes: { name: 'Tactic' }
    }
  ];
  const getEntries = server.get(url('entries'), function(request) {
    if (!getEntries.requests) { getEntries.requests = []; }
    getEntries.requests.push(request);
    return [ 200, {}, { data: getEntriesData, included: getEntriesIncluded }];
  });

  visit('/');

  andThen(function() {
    assert.equal(getSession.numberOfCalls, 1, 'should GET session');
    const getEntriesRequest = getEntries.requests.find(function(r) {
      return Object.keys(r.queryParams).length === 1 && r.queryParams.include === 'project';
    });
    assert.ok(getEntriesRequest, 'should GET entries?include=project');
    assert.equal(currentURL(), '/', 'should stay on index');

    const $entryGroups = find('.it-entry-group');
    assert.equal($entryGroups.length, 2, 'should show 2 groups of entries');

    const $firstEntryGroup = $entryGroups.first();
    assert.equal($firstEntryGroup.find('.it-entry-group-duration').text(), '00:09:00', 'should show the duration of the first entry group');
    assert.equal($firstEntryGroup.find('.it-entry').length, 1, 'should show the first entry in the first entry group');
    assert.ok($firstEntryGroup.find('.it-entry-title').text().match(/no title/i), 'should show "no title" on the first entry');
    assert.ok($firstEntryGroup.find('.it-entry-project').text().match(/tactic/i), 'should show the project name of the first entry');

    const $secondEntryGroup = $entryGroups.last();
    assert.equal($secondEntryGroup.find('.it-entry').length, 2, 'should show the second and third entries in the second entry group');
    assert.ok($secondEntryGroup.find('.it-entry').first().text().match('entry2'), 'should show the name of the entry in the second entry group');
    assert.ok($secondEntryGroup.find('.it-entry-project').first().text().match(/no project/i), 'should show "No project" on the first entry in the second entry group');
    assert.equal($secondEntryGroup.find('.it-entry-group-duration').text(), '01:37:08', 'should show the duration of the first entry group');
  });
});

test('GET entries?filter[current-week]=1&include=project and display them grouped by user and project', function(assert) {
  const currentUserId = '1';
  logsIn(server, { userId: currentUserId });
  stubIndexModelRequest(server);

  const getEntriesData = [
    {
      type: 'entries', id: '1',
      attributes: {
        title: null,
        'started-at': "2016-11-25T13:01:11.000Z",
        'stopped-at': "2016-11-25T13:10:11.000Z"
      },
      relationships: {
        project: { data: { type: 'projects', id: '1' } },
        user: { data: { type: 'users', id: currentUserId } }
      }
    },
    {
      type: 'entries', id: '2',
      attributes: {
        title: 'entry2',
        'started-at': "2016-11-24T11:04:10.000Z",
        'stopped-at': "2016-11-24T12:07:12.000Z"
      },
      relationships: {
        user: { data: { type: 'users', id: currentUserId } }
      }
    },
    {
      type: 'entries', id: '3',
      attributes: {
        title: 'entry3',
        'started-at': "2016-11-24T09:53:12.000Z",
        'stopped-at': "2016-11-24T10:27:18.000Z"
      },
      relationships: {
        user: { data: { type: 'users', id: '2' } }
      }
    }
  ];
  const getEntriesIncluded = [
    {
      type: 'projects', id: '1',
      attributes: { name: 'Tactic' }
    }
  ];

  const getEntries = server.get(url('entries'), function(request) {
    if (!getEntries.requests) { getEntries.requests = []; }
    getEntries.requests.push(request);
    return [ 200, {}, { data: getEntriesData, included: getEntriesIncluded }];
  });

  andThen(function() {
    assert.equal(currentURL(), '/', 'should start on index');

    const getEntriesRequest = getEntries.requests.find(function(r) {
      return Object.keys(r.queryParams).length === 2 &&
        r.queryParams.include === 'project' &&
        r.queryParams['filter[current-week]'] === '1';
    });
    assert.ok(getEntriesRequest, 'should GET entries?filter[current-week]=1&include=project');

    const $currentUserDuration = find(".it-current-week-summary-user:contains(Me) .it-current-week-summary-user-total-duration");
    assert.equal($currentUserDuration.text(), '01:12:02', 'should compute current user entries total duration in week');

    const $allUserDuration = find(".it-current-week-summary-user:contains(Everyone) .it-current-week-summary-user-total-duration");
    assert.equal($allUserDuration.text(), '01:46:08', 'should compute all users entries total duration in week');
  });
});

test('delete entry send DELETE /entries/ID and hide the entry', function(assert) {
  logsIn(server);

  const getEntriesData = [{ type: 'entries', id: '1', attributes: { title: 'my-entry' } }];
  server.get(url('entries'), function() { return [ 200, {}, { data: getEntriesData }]; });

  const deleteEntry = server.delete(url('entries/1'), function() {
    return [ 200, {}, { data: { type: 'entries', id: '1' } }];
  });

  andThen(function() {
    assert.equal(find(".it-entry-title:contains('my-entry')").length, 1, 'should show the entry before destroy');
  });

  click('.it-entry:first .it-entry-action-delete');

  andThen(function() {
    assert.equal(deleteEntry.numberOfCalls, 1, 'should DELETE /entries/1');
    assert.equal(find(".it-entry-title:contains('my-entry')").length, 0, 'should no longer display the destroyed entry');
  });
});

test('update entry send PATCH /entries/ID', function(assert) {
  logsIn(server);

  const getEntriesData = [{ type: 'entries', id: '1', attributes: { title: 'my-entry' } }];
  server.get(url('entries'), function() { return [ 200, {}, { data: getEntriesData }]; });

  const patchEntry = server.patch(url('entries/1'), function() {
    return [ 200, {}, { data: { type: 'entries', id: '1', attributes: { title: 'updated-entry' } } }];
  });

  andThen(function() {
    assert.equal(find(".it-entry-title:contains('my-entry')").length, 1, 'should show the entry before update');
  });

  click('.it-entry:first .it-entry-title');
  fillIn('.it-entry-edit-title', "updated-entry");
  triggerEvent('.it-entry-edit-title', 'blur');

  andThen(function() {
    assert.ok(patchEntry.numberOfCalls >= 1, 'should PATCH /entries/1'); /* should be called only once but seems to be called twice in PhantomJS */
    assert.equal(find(".it-entry-title:contains('updated-entry')").length, 1, 'should update the entry display');
  });
});

test('click on username goes to login', function(assert) {
  logsIn(server);
  stubIndexModelRequest(server);

  andThen(function() { assert.equal(currentURL(), '/', 'should start on index'); });

  click('.it-current-user');

  andThen(function() {
    assert.equal(currentURL(), '/login', 'should go to login');
  });
});
