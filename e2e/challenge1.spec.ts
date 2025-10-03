import { expect, test } from '@playwright/test';

test.describe('Challenge 1: Data Processing & Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
  });

  test('should display data table with users', async ({ page }) => {
    // Wait for table to load
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();

    // Check if users are displayed
    const userRows = page.locator('tbody tr');
    await expect(userRows.first()).toBeVisible();

    // Check table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Orders")')).toBeVisible();
    await expect(page.locator('th:has-text("Total")')).toBeVisible();
  });

  test('should support pagination', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[data-testid="user-table"]');

    // Check pagination controls
    const pagination = page.locator('[data-testid="pagination"]');
    await expect(pagination).toBeVisible();

    // Test next page
    const nextButton = pagination.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Verify page changed
      await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    }
  });

  test('should support search functionality', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[data-testid="user-table"]');

    // Test search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('john');
    await page.waitForTimeout(500); // Wait for debounce

    // Wait for search results
    await page.waitForLoadState('networkidle');

    // Verify search results
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should support sorting', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[data-testid="user-table"]');

    // Test sorting by name
    const nameHeader = page.locator('th:has-text("Name")');
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify sorting indicator
    await expect(nameHeader.locator('svg')).toBeVisible();
  });

  test('should support virtual scrolling', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[data-testid="user-table"]');

    // Enable virtual scrolling
    const virtualToggle = page.locator('input[type="checkbox"]');
    await virtualToggle.check();

    // Wait for virtual table to load
    await page.waitForSelector('[data-testid="virtual-table"]');

    // Verify virtual scrolling is working
    await expect(page.locator('[data-testid="virtual-table"]')).toBeVisible();
  });
});
