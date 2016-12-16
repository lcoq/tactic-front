import { test } from 'qunit';
import moduleForAcceptance from 'tactic-front/tests/helpers/module-for-acceptance';
import { setupServer, teardownServer } from '../helpers/fake-server';
import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

let server;

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
  stubLoginModelRequest(server);
  visit('/projects');
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

  visit('/projects');

  andThen(function() {
    assert.equal(getSession.numberOfCalls, 1, 'should GET session');
    assert.equal(getSession.headers['Authorization'], 'session-token', 'should have send session token on Authorization header');
    assert.equal(currentURL(), '/login', 'should redirect to login');
  });
});

test('GET clients, GET projects and display them when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  server.get(url('entries'), function() { return [ 200, {}, { data: [] }]; });

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

  const getProjectsData = [
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
  ];
  const getProjects = server.get(url('projects'), function() { return [ 200, {}, { data: getProjectsData }]; });

  const getClientsData = [
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
  ];
  const getClients = server.get(url('clients'), function() { return [ 200, {}, { data: getClientsData }]; });

  visit('/projects');

  andThen(function() {
    assert.equal(currentURL(), '/projects', 'should stay on projects');
    assert.equal(getProjects.numberOfCalls, 1, 'should GET projects');
    assert.equal(getClients.numberOfCalls, 1, 'should GET clients');
    assert.equal(find('.it-project').length, 6, 'should show 6 projects (Tactic,Tictoc, Music projects and 3 "Create new project"');
    assert.equal(find('.it-client').length, 4, 'should show 4 clients (Efficiency, Productivity clients, 1 "No client" and 1 "Create client"');
  });
});

/* TODO fix test : find a way to click on .it-project-create and keep the focus on it until a name is typed

test('create a project', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  server.get(url('entries'), function() { return [ 200, {}, { data: [] }]; });
  server.get(url('projects'), function() { return [ 200, {}, { data: [] }]; });
  server.get(url('clients'), function() { return [ 200, {}, { data: [] }]; });

  const postProjectData = { type: 'projects', id: '99', attributes: { name: 'Toctoc' } };
  const postProject = server.post(url('projects'), function() { return [ 200, {}, { data: postProjectData }]; });

  visit('/projects');
  click('.it-project-create');

  andThen(function() {
    assert.equal(postProject.numberOfCalls, 1, 'should POST projects');
  });
});
*/
