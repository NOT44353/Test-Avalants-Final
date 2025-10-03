# Performance Testing Scripts

This directory contains performance testing scripts for the full-stack coding challenges project.

## Performance Test

The `performance-test.js` script tests API endpoints for response times and throughput.

### Usage

```bash
# Basic performance test
node performance-test.js

# Load test with more concurrent requests
CONCURRENT_REQUESTS=50 TOTAL_REQUESTS=500 node performance-test.js

# Stress test
CONCURRENT_REQUESTS=100 TOTAL_REQUESTS=1000 node performance-test.js

# Test against different API URL
API_URL=http://localhost:3001 node performance-test.js
```

### Environment Variables

- `API_URL`: Base URL for the API (default: http://localhost:3001)
- `CONCURRENT_REQUESTS`: Number of concurrent requests per test (default: 10)
- `TOTAL_REQUESTS`: Total number of requests per test (default: 100)

### Test Endpoints

The script tests the following endpoints:

1. **Health Check** (`/health`)
   - Threshold: < 100ms
   - Tests server availability and basic metrics

2. **Users API** (`/api/users`)
   - Threshold: < 500ms
   - Tests pagination and data retrieval performance

3. **Search API** (`/api/search`)
   - Threshold: < 300ms
   - Tests search functionality with various terms

4. **Quotes API** (`/api/quotes/snapshot`)
   - Threshold: < 200ms
   - Tests real-time data retrieval

### Output

The script provides detailed performance metrics:

- Response times (min, max, average)
- Success/failure rates
- Requests per second
- Performance threshold compliance

### Example Output

```
🚀 Starting performance tests...
📊 Configuration:
   Base URL: http://localhost:3001
   Concurrent requests: 10
   Total requests per test: 100

🏥 Testing Health endpoint...
✅ Health endpoint: 10/10 successful
   Average: 15.23ms
   Min: 12.45ms
   Max: 18.67ms

📈 Performance Test Summary
========================
Total time: 1250.45ms
Total requests: 40
Successful: 40
Failed: 0
Success rate: 100.00%
Average response time: 31.26ms
Requests per second: 32.00

📊 Per-endpoint results:
  health: 15.23ms avg (10/10 successful)
  users: 45.67ms avg (10/10 successful)
  search: 28.34ms avg (10/10 successful)
  quotes: 12.89ms avg (10/10 successful)

🎯 Performance thresholds:
  health: ✅ 15.23ms (threshold: 100ms)
  users: ✅ 45.67ms (threshold: 500ms)
  search: ✅ 28.34ms (threshold: 300ms)
  quotes: ✅ 12.89ms (threshold: 200ms)

🎉 All performance tests passed!
```

### Integration with CI/CD

The performance test can be integrated into CI/CD pipelines:

```yaml
- name: Performance Test
  run: |
    cd scripts
    node performance-test.js
  env:
    API_URL: http://localhost:3001
    CONCURRENT_REQUESTS: 20
    TOTAL_REQUESTS: 200
```

### Troubleshooting

If tests fail:

1. **Check server availability**: Ensure the API server is running
2. **Verify data seeding**: Run `npm run seed` to ensure test data exists
3. **Check system resources**: Ensure sufficient CPU and memory
4. **Review logs**: Check server logs for errors or warnings

### Customization

You can customize the test by modifying:

- Test endpoints in the `runAllTests()` method
- Performance thresholds in the `printSummary()` method
- Request parameters and headers
- Test data and search terms

