export default function userSummaryStubs() {
  return {
    getCurrentWeekEntries: {
      path: 'entries',
      match(request) { return request.queryParams['filter[current-week]'] === '1'; },
      body: { data: [] }
    },
    getCurrentMonthEntries: {
      path: 'entries',
      match(request) { return request.queryParams['filter[current-month]'] === '1'; },
      body: { data: [] }
    }    
  };
}
