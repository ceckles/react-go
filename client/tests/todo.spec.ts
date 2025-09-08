// #github-pull-request_copilot-coding-agent: Debug Todo App with GitHub MCP server
import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should perform complete todo lifecycle', async ({ page }) => {
    // 1. Create a new todo
    const uniqueText = `Test Todo ${Date.now()}`;
    const input = page.locator('input[type="text"]');
    const addButton = page.locator('button[type="submit"]');

    const addResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos') && response.request().method() === 'POST'
    );

    await input.fill(uniqueText);
    await addButton.click();

    const addResponse = await addResponsePromise;
    expect(addResponse.ok()).toBeTruthy();

    const todoData = await addResponse.json();
    const todoId = todoData._id;

    // Verify todo was created
    const todoItem = page.locator(`[data-testid="todo-item-${todoId}"]`);
    await expect(todoItem).toBeVisible();
    
    const badge = page.locator(`[data-testid="todo-badge-${todoId}"]`);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('In Progress');

    // 2. Mark todo as completed
    const updateResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos/') && response.request().method() === 'PATCH'
    );

    const completeButton = page.locator(`[data-testid="complete-button-${todoId}"]`);
    await expect(completeButton).toBeVisible();
    await completeButton.click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    // Verify completion
    await expect(badge).toHaveText('Done', { timeout: 5000 });

    // 3. Delete the todo
    const deleteResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos/') && response.request().method() === 'DELETE'
    );

    const deleteButton = page.locator(`[data-testid="delete-button-${todoId}"]`);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    await deleteResponsePromise;

    // Verify deletion
    await expect(todoItem).not.toBeVisible({ timeout: 5000 });
  });

  test('should handle server errors gracefully', async ({ page }) => {
    const dialogPromise = page.waitForEvent('dialog');

    await page.route('**/api/todos', route => {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Error creating todo' })
      });
    });

    const input = page.locator('input[type="text"]');
    const addButton = page.locator('button[type="submit"]');
    await input.fill('Error Test Todo');
    await addButton.click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Error creating todo');
    await dialog.accept();
  });
});
