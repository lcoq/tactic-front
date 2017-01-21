import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import Ember from 'ember';

import { setupServer, teardownServer } from '../helpers/fake-server';
import defineRequestStubs from '../helpers/define-request-stubs';
import indexRouteStubs from '../helpers/index-route-stubs';
import loginRouteStubs from '../helpers/login-route-stubs';

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

test('redirects to login when not authenticated', function(assert) {
  defineRequestStubs(server, loginRouteStubs());

  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('GET sessions and redirects to login when a session token is stored in cookies but is invalid', function(assert) {
  const stubs = defineRequestStubs(server, Ember.merge(loginRouteStubs(), {
    getSessions: {
      path: 'sessions',
      match(request) { return request.requestHeaders['Authorization'] === 'session-token'; },
      status: 403
    }
  }));

  document.cookie = "token=session-token; path=/";

  visit('/');

  andThen(function() {
    assert.equal(stubs.getSessions.requests.length, 1, 'should GET session');
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('GET sessions, GET entries?include=project and display them grouped by day when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    getEntries: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 1 && request.queryParams.include === 'project'; },
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
        ],
        included: [
          {
            type: 'projects', id: '1',
            attributes: { name: 'Tactic' }
          }
        ]
      }
    }
  }));

  visit('/');

  andThen(function() {
    assert.equal(stubs.getSessions.requests.length, 1, 'should GET session');
    assert.equal(stubs.getEntries.requests.length, 1, 'should GET entries?include=project');
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

test('GET entries?filter[running]=1 and do not start the timer when no running entry is returned by the server', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    getRunningEntry: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 2 && request.queryParams['filter[running]'] === '1' && request.queryParams['include'] === 'project'; },
      body: { data: null }
    }
  }));

  visit('/');

  andThen(function() {
    assert.equal(stubs.getRunningEntry.requests.length, 1, 'should GET entries?filter[running=1]&include=project');
    assert.equal(find('.it-entry-create-stop').length, 0, 'should not start the timer');
  });
});

test('GET entries?filter[running]=1 and starts the timer when a running entry is returned by the server', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    getRunningEntry: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 2 && request.queryParams['filter[running]'] === '1' && request.queryParams['include'] === 'project'; },
      body: {
        data: {
          type: 'entries', id: '1',
          attributes: {
            title: "My entry",
            'started-at': (new Date()).toISOString(),
            'stopped-at': null
          },
          relationships: {
            user: { data: { type: 'users', id: '1' } }
          }
        }
      }
    }
  }));

  visit('/');

  andThen(function() {
    assert.equal(stubs.getRunningEntry.requests.length, 1, 'should GET entries?filter[running=1]&include=project');
    assert.equal(find('.it-entry-create-stop').length, 1, 'should start the timer');
  });
});

test('GET entries for user summary and display total for week and month', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    getCurrentWeekEntries: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 2 && request.queryParams['filter[current-week]'] === '1' && request.queryParams['filter[user-id]'].length === 1; },
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
              project: { data: { type: 'projects', id: '1' } },
              user: { data: { type: 'users', id: '1' } }
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
              user: { data: { type: 'users', id: '1' } }
            }
          }
        ],
        included: [
          {
            type: 'projects', id: '1',
            attributes: { name: 'Tactic' }
          }
        ]
      }
    },
    getCurrentMonthEntries: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 2 && request.queryParams['filter[current-month]'] === '1' && request.queryParams['filter[user-id]'].length === 1; },
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
              project: { data: { type: 'projects', id: '1' } },
              user: { data: { type: 'users', id: '1' } }
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
              user: { data: { type: 'users', id: '1' } }
            }
          },
          {
            type: 'entries', id: '5',
            attributes: {
              title: 'entry5',
              'started-at': "2016-11-20T11:22:10.000Z",
              'stopped-at': "2016-11-20T13:12:12.000Z"
            },
            relationships: {
              user: { data: { type: 'users', id: '1' } }
            }
          }
        ],
        included: [
          {
            type: 'projects', id: '1',
            attributes: { name: 'Tactic' }
          }
        ]
      }
    }

  }));

  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/', 'should start on index');
    assert.equal(stubs.getCurrentWeekEntries.requests.length, 1, 'should GET entries for the week');
    assert.equal(stubs.getCurrentMonthEntries.requests.length, 1, 'should GET entries for the month');

    const $currentWeekDuration = find(".it-user-summary-section:contains(week) .it-user-summary-duration");
    assert.equal($currentWeekDuration.text(), '01:12:02', 'should give total duration for the week');

    const $currentMonthDuration = find(".it-user-summary-section:contains(month) .it-user-summary-duration");
    assert.equal($currentMonthDuration.text(), '03:02:04', 'should compute all users entries total duration in month');
  });
});

test('delete entry send DELETE /entries/ID and hide the entry', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    getEntries: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 1 && request.queryParams.include === 'project'; },
      body: {
        data: [
          {
            type: 'entries', id: '1',
            attributes: { title: 'my-entry' }
          }
        ]
      }
    },

    deleteEntry: {
      type: 'delete',
      path: 'entries/1',
      match() { return true; },
      body: {
        data: {
          type: 'entries', id: '1'
        }
      }
    }
  }));

  visit('/');

  andThen(function() {
    assert.equal(find(".it-entry-title:contains('my-entry')").length, 1, 'should show the entry before destroy');
  });

  click('.it-entry:first .it-entry-action-delete');

  andThen(function() {
    assert.equal(stubs.deleteEntry.requests.length, 1, 'should DELETE /entries/1');
    assert.equal(find(".it-entry-title:contains('my-entry')").length, 0, 'should no longer display the destroyed entry');
  });
});

test('update entry send PATCH /entries/ID', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    getEntries: {
      path: 'entries',
      match(request) { return Object.keys(request.queryParams).length === 1 && request.queryParams.include === 'project'; },
      body: {
        data: [
          {
            type: 'entries', id: '1',
            attributes: {
              title: 'my-entry',
              'started-at': "2016-12-07T09:42:04.000Z",
              'stopped-at': "2016-12-07T09:44:04.000Z"
            }
          }
        ]
      }
    },

    patchEntry: {
      type: 'patch',
      path: 'entries/1',
      match(request) {
        const body = JSON.parse(request.requestBody);
        return body.data && body.data.attributes && body.data.attributes.title === 'updated-entry';
      },
      body: {
        data: {
          type: 'entries', id: '1',
          attributes: { title: 'updated-entry' }
        }
      }
    }

  }));

  visit('/');

  andThen(function() {
    assert.equal(find(".it-entry-title:contains('my-entry')").length, 1, 'should show the entry before update');
  });

  click('.it-entry:first .it-entry-title');
  fillIn('.it-entry-edit-title', "updated-entry");
  click('.it-header'); // send focusout

  andThen(function() {
    assert.equal(stubs.patchEntry.requests.length, 1, 'should PATCH /entries/1');
    assert.equal(find(".it-entry-title:contains('updated-entry')").length, 1, 'should update the entry display');
  });
});

test('start entry send POST /entries, stop it send PATCH /entries', function(assert) {
  document.cookie = "token=session-token; path=/";

  const stubs = defineRequestStubs(server, Ember.merge(indexRouteStubs(), {
    postEntry: {
      type: 'post',
      path: 'entries',
      match(request) {
        const body = JSON.parse(request.requestBody);
        return body.data && body.data.attributes && body.data.attributes['started-at'];
      },
      body: {
        data: {
          type: 'entries', id: '99',
          attributes: { title: null }
        }
      }
    },

    patchEntry: {
      type: 'patch',
      path: 'entries/99',
      match(request) {
        const body = JSON.parse(request.requestBody);
        return body.data &&
          body.data.attributes &&
          body.data.attributes.title === 'new-entry' &&
          body.data.attributes['started-at'] &&
          body.data.attributes['stopped-at'];
      },
      body: {
        data: {
          type: 'entries', id: '99',
          attributes: { title: 'new-entry' }
        }
      }
    }

  }));

  visit('/');

  click('.it-entry-create-start');

  andThen(function() {
    assert.equal(stubs.postEntry.requests.length, 1, 'should POST /entries');
  });

  fillIn('.it-entry-create-title', "new-entry");
  click('.it-entry-create-stop');

  andThen(function() {
    assert.equal(stubs.patchEntry.requests.length, 1, 'should PATCH /entries/99');
    assert.equal(find(".it-entry-title:contains(new-entry)").length, 1, 'should add the created entry in the list');
  });
});

test('click on username goes to login', function(assert) {
  document.cookie = "token=session-token; path=/";

  defineRequestStubs(server, Ember.merge(
    indexRouteStubs(),
    loginRouteStubs()
  ));

  visit('/');
  click('.it-current-user');

  andThen(function() {
    assert.equal(currentURL(), '/login', 'should go to login');
  });
});
