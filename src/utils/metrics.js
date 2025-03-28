import client from 'prom-client';

// Collect default Node.js metrics (memory, CPU, event loop lag, etc.)
client.collectDefaultMetrics();

// Export the registry for use in your app (for exposing via /metrics endpoint)
export const register = client.register;

// --- Custom Metrics ---

// 1. Counter for the number of times the reports page is requested.
export const reportsPageRequests = new client.Counter({
  name: 'reports_page_requests_total',
  help: 'Total number of requests to the reports page',
});

// 2. Histogram for measuring the response time (in seconds) for the reports page.
export const reportsPageResponseTime = new client.Histogram({
  name: 'reports_page_response_time_seconds',
  help: 'Response time for the reports page in seconds',
  buckets: [0.1, 0.5, 1, 2, 5],
});

// 3. Counter for external API errors (e.g., if the API call to fetch reports fails)
export const apiErrors = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of errors encountered when calling external APIs',
});