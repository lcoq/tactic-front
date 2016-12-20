export default function currentWeekStubs() {
  return {
    getCurrentWeekEntries: {
      path: 'entries',
      match(request) { return request.queryParams['filter[current-week]'] === '1'; },
      body: { data: [] }
    }
  };
}
