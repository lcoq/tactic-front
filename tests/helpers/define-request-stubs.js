/* jshint loopfunc: true */

import ENV from '../../config/environment';

function url(path) {
  return '/' + ENV.APP.namespace + path;
}

function stubRequests(server, stubbedRequests) {
  for (let type in stubbedRequests) {
    for (let path in stubbedRequests[type]) {
      server[type].call(server, url(path), function(request) {
        const stub = stubbedRequests[type][path].find(function(s) { return s.match(request); });
        if (stub) {
          stub.requests.push(request);
          return [ stub.status, stub.headers, stub.body ];
        }
      });
    }
  }
}

function addDefaultStubAttributes(stub) {
  if (!stub.type) { stub.type = 'get'; }
  if (!stub.status) { stub.status = 200; }
  if (!stub.headers) { stub.headers = {}; }
  if (!stub.body) { stub.body = {}; }
  stub.requests = [];
}

export default function defineRequestStubs(server, stubs) {
  const stubbedRequests = {
    get: {},
    post: {},
    patch: {},
    delete: {}
  };

  let stub;
  for (let name in stubs) {
    stub = stubs[name];
    addDefaultStubAttributes(stub);
    if (!stubbedRequests[stub.type][stub.path]) {
      stubbedRequests[stub.type][stub.path] = [];
    }
    stubbedRequests[stub.type][stub.path].push(stub);
  }

  stubRequests(server, stubbedRequests);

  return stubs;
}
