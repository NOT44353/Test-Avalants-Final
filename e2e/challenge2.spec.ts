import { expect, test } from '@playwright/test';

test.describe('Challenge 2: Tree & Hierarchy Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nodes');
    await page.waitForLoadState('networkidle');
  });

  test('should display tree view', async ({ page }) => {
    // Wait for tree to load
    await expect(page.locator('[data-testid="tree-view"]')).toBeVisible();

    // Check if root nodes are displayed
    const treeNodes = page.locator('[data-testid="tree-node"]');
    await expect(treeNodes.first()).toBeVisible();
  });

  test('should support lazy loading', async ({ page }) => {
    // Wait for tree to load
    await page.waitForSelector('[data-testid="tree-view"]');

    // Find a node with children
    const expandableNode = page.locator('[data-testid="tree-node"]:has([data-testid="expand-button"])').first();

    if (await expandableNode.isVisible()) {
      // Click expand button
      const expandButton = expandableNode.locator('[data-testid="expand-button"]');
      await expandButton.click();

      // Wait for children to load
      await page.waitForTimeout(1000);

        // Verify children are loaded
        const children = expandableNode.locator('[data-testid="tree-node"]');
        await expect(children.first()).toBeVisible();
    }
  });

  test('should support search functionality', async ({ page }) => {
    // Wait for tree to load
    await page.waitForSelector('[data-testid="tree-view"]');

    // Test search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('team');
    await page.waitForTimeout(500); // Wait for debounce

    // Wait for search results
    await page.waitForLoadState('networkidle');

    // Verify search results are highlighted
    const highlightedNodes = page.locator('[data-testid="tree-node"].highlighted');
    await expect(highlightedNodes.first()).toBeVisible();
  });

  test('should display node details', async ({ page }) => {
    // Wait for tree to load
    await page.waitForSelector('[data-testid="tree-view"]');

    // Click on a node
    const firstNode = page.locator('[data-testid="tree-node"]').first();
    await firstNode.click();

    // Verify node details panel
    await expect(page.locator('[data-testid="node-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="node-name"]')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Wait for tree to load
    await page.waitForSelector('[data-testid="tree-view"]');

    // Focus on tree
    const treeView = page.locator('[data-testid="tree-view"]');
    await treeView.focus();

    // Test keyboard navigation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Verify focus moved
    const focusedNode = page.locator('[data-testid="tree-node"]:focus');
    await expect(focusedNode).toBeVisible();
  });
});
