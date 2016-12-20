export default function loginRouteStubs() {
  return {
    getUsers: {
      path: 'users',
      match(request) { return Object.keys(request.queryParams).length === 0; },
      body: { data: [] }
    }
  };
}
