// Test setup file
import { dataStore } from '../models/DataStore';

// Clear data before each test
beforeEach(() => {
  dataStore.clear();
});

// Add a dummy test to prevent "no tests" error
describe('Setup', () => {
  it('should be configured correctly', () => {
    expect(true).toBe(true);
  });
});

