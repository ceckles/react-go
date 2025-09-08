import { test } from './debug-helpers';
import { expect } from '@playwright/test';

test('debug todo app operations', async ({ debugPage: page }) => {
  await page.goto('http://localhost:5173');

  // Create a todo
  const uniqueText = `Debug Test Todo ${Date.now()}`;
  const input = page.locator('input[type="text"]');
  const addButton = page.locator('button[type="submit"]');

  // Set up response promise
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/todos') && response.request().method() === 'POST'
  );

  // Fill and submit form
  await input.fill(uniqueText);
  await addButton.click();

  // Wait for response and extract todo ID
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const todoData = await response.json();
  const todoId = todoData._id;

  // Debug checkpoint 1: Todo creation
  console.log(`[Debug] Created todo with ID: ${todoId}`);

  // Verify todo exists
  const todoItem = page.locator(`[data-testid="todo-item-${todoId}"]`);
  await expect(todoItem).toBeVisible();

  // Complete todo
  const updateResponsePromise = page.waitForResponse(response =>
    response.url().includes(`/api/todos/${todoId}`) && response.request().method() === 'PATCH'
  );

  // Debug checkpoint 2: Before completing todo
  console.log(`[Debug] Attempting to complete todo ${todoId}`);

  const completeButton = page.locator(`[data-testid="complete-button-${todoId}"]`);
  await completeButton.click();

  // Wait for update
  const updateResponse = await updateResponsePromise;
  expect(updateResponse.ok()).toBeTruthy();

  // Debug checkpoint 3: After completing todo
  console.log(`[Debug] Todo ${todoId} marked as completed`);

  // Delete todo
  const deleteResponsePromise = page.waitForResponse(response =>
    response.url().includes(`/api/todos/${todoId}`) && response.request().method() === 'DELETE'
  );

  // Debug checkpoint 4: Before deleting todo
  console.log(`[Debug] Attempting to delete todo ${todoId}`);

  const deleteButton = page.locator(`[data-testid="delete-button-${todoId}"]`);
  await deleteButton.click();

  // Wait for deletion
  const deleteResponse = await deleteResponsePromise;
  expect(deleteResponse.ok()).toBeTruthy();

  // Debug checkpoint 5: After deleting todo
  console.log(`[Debug] Todo ${todoId} deleted`);

  // Final verification
  await expect(todoItem).not.toBeVisible();
});
