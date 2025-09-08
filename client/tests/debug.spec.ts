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

  // Add both todos quickly with enhanced monitoring
  const todoIds: string[] = [];
  for (const todoText of todos) {
    // Monitor both the POST request and any optimistic updates
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos') && response.request().method() === 'POST'
    );

    await input.fill(todoText);
    await addButton.click();

    const response = await responsePromise;
    const data = await response.json();
    todoIds.push(data._id);
    
    console.log(`[MCP Debug] Created todo: ${data._id} - "${data.body}"`);
  }

  // Wait a bit to ensure both todos are fully rendered
  await page.waitForTimeout(500);

  // Verify both todos are in the initial state
  for (const todoId of todoIds) {
    const badge = page.locator(`[data-testid="todo-badge-${todoId}"]`);
    await expect(badge).toHaveText('In Progress');
  }

  // Try to complete both todos almost simultaneously with enhanced monitoring
  console.log('[MCP Debug] Attempting to complete todos simultaneously');
  
  // Set up response monitoring for both PATCH requests
  const [patchResponse1, patchResponse2] = await Promise.all([
    page.waitForResponse(response => 
      response.url().includes(`/api/todos/${todoIds[0]}`) && response.request().method() === 'PATCH'
    ),
    page.waitForResponse(response => 
      response.url().includes(`/api/todos/${todoIds[1]}`) && response.request().method() === 'PATCH'
    ),
    // Click both complete buttons simultaneously
    Promise.all([
      page.locator(`[data-testid="complete-button-${todoIds[0]}"]`).click(),
      page.locator(`[data-testid="complete-button-${todoIds[1]}"]`).click()
    ])
  ]);

  // Log the server responses to debug race conditions
  const data1 = await patchResponse1.json();
  const data2 = await patchResponse2.json();
  console.log(`[MCP Debug] Todo 1 response:`, data1);
  console.log(`[MCP Debug] Todo 2 response:`, data2);

  // Check the state of both todos with retries for eventual consistency
  for (const todoId of todoIds) {
    const badge = page.locator(`[data-testid="todo-badge-${todoId}"]`);
    
    // Wait for optimistic update to settle and server response to be processed
    await expect(badge).toHaveText('Done', { timeout: 10000 });
    
    // Also verify the visual state
    const text = page.locator(`[data-testid="todo-text-${todoId}"]`);
    await expect(text).toHaveCSS('text-decoration', /line-through/);
    
    console.log(`[MCP Debug] Todo ${todoId} correctly marked as Done`);
  }

  // Verify no todos are stuck in loading state
  for (const todoId of todoIds) {
    const spinner = page.locator(`[data-testid="complete-spinner-${todoId}"]`);
    await expect(spinner).not.toBeVisible();
  }

  // Clean up with proper monitoring
  console.log('[MCP Debug] Cleaning up todos');
  for (const todoId of todoIds) {
    const deletePromise = page.waitForResponse(response =>
      response.url().includes(`/api/todos/${todoId}`) && response.request().method() === 'DELETE'
    );
    await page.locator(`[data-testid="delete-button-${todoId}"]`).click();
    await deletePromise;
  }

  console.log('[MCP Debug] Test completed successfully');
});
