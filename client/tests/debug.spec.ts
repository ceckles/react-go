import { test } from './mcp-server';  // Using our MCP-enabled test
import { expect } from '@playwright/test';

// #github-pull-request_copilot-coding-agent: Debug race condition in todo completion state updates
test('should handle rapid state updates correctly', async ({ mcpPage: page }) => {
  await page.goto('http://localhost:5173');

  // Create two todos in quick succession
  const todos = [
    `Quick Todo 1 ${Date.now()}`,
    `Quick Todo 2 ${Date.now() + 1}`
  ];

  // Add first todo
  const input = page.locator('input[type="text"]');
  const addButton = page.locator('button[type="submit"]');

  // Add both todos quickly
  const todoIds: string[] = [];
  for (const todoText of todos) {
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos') && response.request().method() === 'POST'
    );

    await input.fill(todoText);
    await addButton.click();

    const response = await responsePromise;
    const data = await response.json();
    todoIds.push(data._id);
  }

  // Try to complete both todos almost simultaneously
  console.log('[MCP Debug] Attempting to complete todos simultaneously');
  
  const [firstComplete, secondComplete] = await Promise.all([
    page.locator(`[data-testid="complete-button-${todoIds[0]}"]`).click(),
    page.locator(`[data-testid="complete-button-${todoIds[1]}"]`).click()
  ]);

  // Check the state of both todos
  for (const todoId of todoIds) {
    const badge = page.locator(`[data-testid="todo-badge-${todoId}"]`);
    await expect(badge).toHaveText('Done', { timeout: 5000 });  // This might fail due to race conditions
  }

  // Clean up
  console.log('[MCP Debug] Cleaning up todos');
  for (const todoId of todoIds) {
    const deletePromise = page.waitForResponse(response =>
      response.url().includes(`/api/todos/${todoId}`) && response.request().method() === 'DELETE'
    );
    await page.locator(`[data-testid="delete-button-${todoId}"]`).click();
    await deletePromise;
  }
});
