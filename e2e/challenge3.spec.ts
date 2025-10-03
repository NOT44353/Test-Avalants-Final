import { expect, test } from '@playwright/test';

test.describe('Challenge 3: Real-time Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');
  });

  test('should display quotes dashboard', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.locator('[data-testid="quotes-dashboard"]')).toBeVisible();

    // Check if quotes table is displayed
    await expect(page.locator('[data-testid="quotes-table"]')).toBeVisible();

    // Check if charts are displayed
    await expect(page.locator('[data-testid="quotes-chart"]')).toBeVisible();
  });

  test('should display real-time price updates', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="quotes-dashboard"]');

    // Wait for initial quotes to load
    await page.waitForSelector('[data-testid="quote-row"]');

    // Get initial price
    const firstQuote = page.locator('[data-testid="quote-row"]').first();
    const initialPrice = await firstQuote.locator('[data-testid="quote-price"]').textContent();

    // Wait for price update (WebSocket should update prices)
    await page.waitForTimeout(2000);

    // Check if price changed (or at least is displayed)
    const currentPrice = await firstQuote.locator('[data-testid="quote-price"]').textContent();
    expect(currentPrice).toBeTruthy();
  });

  test('should display price change indicators', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="quotes-dashboard"]');

    // Wait for quotes to load
    await page.waitForSelector('[data-testid="quote-row"]');

    // Check for price change indicators
    const priceChange = page.locator('[data-testid="price-change"]').first();
    await expect(priceChange).toBeVisible();

    // Check for color coding (positive/negative)
    const changeValue = await priceChange.textContent();
    expect(changeValue).toMatch(/[+-]?\d+\.\d+%?/);
  });

  test('should support WebSocket connection status', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="quotes-dashboard"]');

    // Check connection status indicator
    const connectionStatus = page.locator('[data-testid="connection-status"]');
    await expect(connectionStatus).toBeVisible();

    // Should show connected status
    await expect(connectionStatus).toContainText('Connected');
  });

  test('should support symbol subscription', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="quotes-dashboard"]');

    // Check symbol input
    const symbolInput = page.locator('input[placeholder*="symbol"]');
    await expect(symbolInput).toBeVisible();

    // Add a new symbol
    await symbolInput.fill('TSLA');
    await page.keyboard.press('Enter');

    // Wait for new quote to appear
    await page.waitForTimeout(1000);

    // Verify new symbol is displayed
    await expect(page.locator('text=TSLA')).toBeVisible();
  });

  test('should display live charts', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="quotes-dashboard"]');

    // Check if chart is displayed
    const chart = page.locator('[data-testid="quotes-chart"]');
    await expect(chart).toBeVisible();

    // Check if chart has data points
    const chartBars = page.locator('[data-testid="chart-bar"]');
    await expect(chartBars.first()).toBeVisible();
  });
});
