const axios = require('axios');
const { performance } = require('perf_hooks');

const API_BASE = 'http://localhost:3001';

class PerformanceTester {
  constructor() {
    this.results = {
      challenge1: {},
      challenge2: {},
      challenge3: {}
    };
  }

  async measureTime(fn, label) {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;
      console.log(`✅ ${label}: ${duration.toFixed(2)}ms`);
      return { success: true, duration, result };
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      console.log(`❌ ${label}: ${duration.toFixed(2)}ms (${error.message})`);
      return { success: false, duration, error: error.message };
    }
  }

  async testChallenge1() {
    console.log('\n🚀 Testing Challenge 1: Data Processing & Rendering');

    // Test 1: Initial page load (50 users)
    const pageLoad = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/users?page=1&pageSize=50`);
      return response.data;
    }, 'Initial page load (50 users)');

    // Test 2: Large page load (200 users)
    const largePageLoad = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/users?page=1&pageSize=200`);
      return response.data;
    }, 'Large page load (200 users)');

    // Test 3: Search performance
    const search = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/users?search=john&page=1&pageSize=50`);
      return response.data;
    }, 'Search performance');

    // Test 4: Sorting performance
    const sorting = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/users?sortBy=orderTotal&sortDir=desc&page=1&pageSize=50`);
      return response.data;
    }, 'Sorting performance');

    // Test 5: Pagination performance
    const pagination = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/users?page=10&pageSize=50`);
      return response.data;
    }, 'Pagination performance');

    this.results.challenge1 = {
      pageLoad,
      largePageLoad,
      search,
      sorting,
      pagination
    };
  }

  async testChallenge2() {
    console.log('\n🌳 Testing Challenge 2: Tree & Hierarchy Rendering');

    // Test 1: Root nodes load
    const rootNodes = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/nodes/root`);
      return response.data;
    }, 'Root nodes load');

    // Test 2: Children load (if any root nodes exist)
    let childrenLoad = { success: false, duration: 0 };
    if (rootNodes.success && rootNodes.result.items.length > 0) {
      const firstNodeId = rootNodes.result.items[0].id;
      childrenLoad = await this.measureTime(async () => {
        const response = await axios.get(`${API_BASE}/api/nodes/${firstNodeId}/children`);
        return response.data;
      }, 'Children load');
    }

    // Test 3: Search performance
    const search = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/search?q=team&limit=100`);
      return response.data;
    }, 'Tree search performance');

    this.results.challenge2 = {
      rootNodes,
      childrenLoad,
      search
    };
  }

  async testChallenge3() {
    console.log('\n📊 Testing Challenge 3: Real-time Dashboard');

    // Test 1: Quotes snapshot
    const snapshot = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/api/quotes/snapshot?symbols=AAPL,MSFT,GOOG`);
      return response.data;
    }, 'Quotes snapshot');

    // Test 2: Health check
    const healthCheck = await this.measureTime(async () => {
      const response = await axios.get(`${API_BASE}/health`);
      return response.data;
    }, 'Health check');

    this.results.challenge3 = {
      snapshot,
      healthCheck
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Performance Tests...\n');

    try {
      await this.testChallenge1();
      await this.testChallenge2();
      await this.testChallenge3();

      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  printSummary() {
    console.log('\n📈 Performance Test Summary');
    console.log('=' .repeat(50));

    // Challenge 1 Summary
    console.log('\nChallenge 1: Data Processing & Rendering');
    console.log(`  Initial page load: ${this.results.challenge1.pageLoad?.duration?.toFixed(2)}ms ${this.results.challenge1.pageLoad?.success ? '✅' : '❌'}`);
    console.log(`  Large page load: ${this.results.challenge1.largePageLoad?.duration?.toFixed(2)}ms ${this.results.challenge1.largePageLoad?.success ? '✅' : '❌'}`);
    console.log(`  Search: ${this.results.challenge1.search?.duration?.toFixed(2)}ms ${this.results.challenge1.search?.success ? '✅' : '❌'}`);
    console.log(`  Sorting: ${this.results.challenge1.sorting?.duration?.toFixed(2)}ms ${this.results.challenge1.sorting?.success ? '✅' : '❌'}`);
    console.log(`  Pagination: ${this.results.challenge1.pagination?.duration?.toFixed(2)}ms ${this.results.challenge1.pagination?.success ? '✅' : '❌'}`);

    // Challenge 2 Summary
    console.log('\nChallenge 2: Tree & Hierarchy Rendering');
    console.log(`  Root nodes: ${this.results.challenge2.rootNodes?.duration?.toFixed(2)}ms ${this.results.challenge2.rootNodes?.success ? '✅' : '❌'}`);
    console.log(`  Children load: ${this.results.challenge2.childrenLoad?.duration?.toFixed(2)}ms ${this.results.challenge2.childrenLoad?.success ? '✅' : '❌'}`);
    console.log(`  Search: ${this.results.challenge2.search?.duration?.toFixed(2)}ms ${this.results.challenge2.search?.success ? '✅' : '❌'}`);

    // Challenge 3 Summary
    console.log('\nChallenge 3: Real-time Dashboard');
    console.log(`  Snapshot: ${this.results.challenge3.snapshot?.duration?.toFixed(2)}ms ${this.results.challenge3.snapshot?.success ? '✅' : '❌'}`);
    console.log(`  Health check: ${this.results.challenge3.healthCheck?.duration?.toFixed(2)}ms ${this.results.challenge3.healthCheck?.success ? '✅' : '❌'}`);

    // Performance Requirements Check
    console.log('\n🎯 Performance Requirements Check');
    console.log('=' .repeat(50));

    const requirements = [
      { name: 'Initial page load < 500ms', met: this.results.challenge1.pageLoad?.duration < 500 },
      { name: 'Large page load < 500ms', met: this.results.challenge1.largePageLoad?.duration < 500 },
      { name: 'Search < 250ms', met: this.results.challenge1.search?.duration < 250 },
      { name: 'Sorting < 200ms', met: this.results.challenge1.sorting?.duration < 200 },
      { name: 'Pagination < 300ms', met: this.results.challenge1.pagination?.duration < 300 },
      { name: 'Root nodes < 300ms', met: this.results.challenge2.rootNodes?.duration < 300 },
      { name: 'Children load < 300ms', met: this.results.challenge2.childrenLoad?.duration < 300 },
      { name: 'Tree search < 500ms', met: this.results.challenge2.search?.duration < 500 },
      { name: 'Snapshot < 200ms', met: this.results.challenge3.snapshot?.duration < 200 },
      { name: 'Health check < 100ms', met: this.results.challenge3.healthCheck?.duration < 100 }
    ];

    const passed = requirements.filter(r => r.met).length;
    const total = requirements.length;

    requirements.forEach(req => {
      console.log(`  ${req.name}: ${req.met ? '✅ PASS' : '❌ FAIL'}`);
    });

    console.log(`\nOverall: ${passed}/${total} requirements met (${Math.round(passed/total*100)}%)`);

    if (passed === total) {
      console.log('\n🎉 All performance requirements met!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some performance requirements not met.');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new PerformanceTester();
tester.runAllTests().catch(console.error);
