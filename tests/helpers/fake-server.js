import Pretender from 'pretender';

export function setupServer() {
  const server = new Pretender();
  server.prepareBody = (body) => { return JSON.stringify(body); };
  server.prepareHeaders = (headers) => { return headers['Content-Type'] = 'application/json'; };
  return server;
}

export function teardownServer(server) {
  server.shutdown();
  server = null;
}
