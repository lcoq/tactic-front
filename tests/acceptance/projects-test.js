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

test('GET projects and display them when a valid session token is stored in cookies', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  server.get(url('entries'), function() { return [ 200, {}, { data: [] }]; });

  const getProjectsData = [
    { type: 'projects', id: '1', attributes: { name: 'Tactic' } },
    { type: 'projects', id: '2', attributes: { name: 'Tictoc' } },
    { type: 'projects', id: '3', attributes: { name: 'Tictac' } }
  ];
  const getProjects = server.get(url('projects'), function() { return [ 200, {}, { data: getProjectsData }]; });

  visit('/projects');

  andThen(function() {
    assert.equal(currentURL(), '/projects', 'should stay on projects');
    assert.equal(getProjects.numberOfCalls, 1, 'should GET projects');
    assert.equal(find('.it-project').length, 4, 'should show 4 projects (3 projects + 1 "Create")');
  });
});

test('create a project', function(assert) {
  document.cookie = "token=session-token; path=/";

  const getSessionData = { type: 'sessions', id: '1', attributes: { token: 'session-token', name: 'louis' } };
  server.get(url('sessions'), function() { return [ 200, {}, { data: getSessionData }]; });

  server.get(url('entries'), function() { return [ 200, {}, { data: [] }]; });
  server.get(url('projects'), function() { return [ 200, {}, { data: [] }]; });

  const postProjectData = { type: 'projects', id: '99', attributes: { name: 'Toctoc' } };
  const postProject = server.post(url('projects'), function() { return [ 200, {}, { data: postProjectData }]; });

  visit('/projects');
  click('.it-project-create');
  // #click seems to remove the focus on the element which stops the project name edit

  andThen(function() {
    assert.equal(postProject.numberOfCalls, 1, 'should POST projects');
  });
});
