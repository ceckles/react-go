import { test, expect } from '@playwright/test';

test.describe('Todo App Debugging Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should track network requests during todo operations', async ({ page }) => {
    // Start monitoring network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/todos')) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });

    // Create todo
    const uniqueText = `Network Test Todo ${Date.now()}`;
    const input = page.locator('input[type="text"]');
    const addButton = page.locator('button[type="submit"]');

    const addResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos') && response.request().method() === 'POST'
    );

    await input.fill(uniqueText);
    await addButton.click();

    const addResponse = await addResponsePromise;
    expect(addResponse.status()).toBe(201);
    
    const todoData = await addResponse.json();
    const todoId = todoData._id;

    // Complete todo
    const updateResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/todos/${todoId}`) && response.request().method() === 'PATCH'
    );

    const completeButton = page.locator(`[data-testid="complete-button-${todoId}"]`);
    await completeButton.click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    // Delete todo
    const deleteResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/todos/${todoId}`) && response.request().method() === 'DELETE'
    );

    const deleteButton = page.locator(`[data-testid="delete-button-${todoId}"]`);
    await deleteButton.click();

    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);

    // Verify all expected requests were made
    expect(requests).toContain(`POST http://localhost:3001/api/todos`);
    expect(requests).toContain(`PATCH http://localhost:3001/api/todos/${todoId}`);
    expect(requests).toContain(`DELETE http://localhost:3001/api/todos/${todoId}`);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const uniqueText = `Slow Network Todo ${Date.now()}`;
    const input = page.locator('input[type="text"]');
    const addButton = page.locator('button[type="submit"]');

    // Set up response promise before action
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/todos') && response.request().method() === 'POST'
    );

    // Fill and submit form
    await input.fill(uniqueText);
    await addButton.click();

    // Wait for response with increased timeout
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // Verify todo appears even with slow network
    const todoData = await response.json();
    const todoItem = page.locator(`[data-testid="todo-item-${todoData._id}"]`);
    await expect(todoItem).toBeVisible({ timeout: 10000 });
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure for POST requests
    await page.route('**/api/todos', route => {
      if (route.request().method() === 'POST') {
        return route.abort('failed');
      }
      return route.continue();
    });

    const uniqueText = `Failed Network Todo ${Date.now()}`;
    const input = page.locator('input[type="text"]');
    const addButton = page.locator('button[type="submit"]');

    // Set up dialog handler
    const dialogPromise = page.waitForEvent('dialog');

    // Try to add todo
    await input.fill(uniqueText);
    await addButton.click();

    // Verify error dialog appears
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Error');
    await dialog.accept();

    // Verify the todo wasn't added
    const todoText = page.getByText(uniqueText);
    await expect(todoText).not.toBeVisible();
  });

  test('should validate UI state after multiple operations', async ({ page }) => {
    // Create multiple todos
    const todos = ['First Todo', 'Second Todo', 'Third Todo'];
    const todoIds: string[] = [];

    for (const todoText of todos) {
      const responsePromise = page.waitForResponse(response =>
        response.url().includes('/api/todos') && response.request().method() === 'POST'
      );

      await page.locator('input[type="text"]').fill(todoText);
      await page.locator('button[type="submit"]').click();

      const response = await responsePromise;
      const data = await response.json();
      todoIds.push(data._id);
    }

    // Complete the second todo
    const updateResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/todos/${todoIds[1]}`) && response.request().method() === 'PATCH'
    );

    await page.locator(`[data-testid="complete-button-${todoIds[1]}"]`).click();
    await updateResponsePromise;

    // Delete the first todo
    const deleteResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/todos/${todoIds[0]}`) && response.request().method() === 'DELETE'
    );

    await page.locator(`[data-testid="delete-button-${todoIds[0]}"]`).click();
    await deleteResponsePromise;

    // Verify final state
    // First todo should be gone
    await expect(page.locator(`[data-testid="todo-item-${todoIds[0]}"]`)).not.toBeVisible();
    
    // Second todo should be marked as done
    const secondTodoBadge = page.locator(`[data-testid="todo-badge-${todoIds[1]}"]`);
    await expect(secondTodoBadge).toHaveText('Done');
    
    // Third todo should still be in progress
    const thirdTodoBadge = page.locator(`[data-testid="todo-badge-${todoIds[2]}"]`);
    await expect(thirdTodoBadge).toHaveText('In Progress');

    // Clean up remaining todos
    for (let i = 1; i < todoIds.length; i++) {
      const deletePromise = page.waitForResponse(response =>
        response.url().includes(`/api/todos/${todoIds[i]}`) && response.request().method() === 'DELETE'
      );
      await page.locator(`[data-testid="delete-button-${todoIds[i]}"]`).click();
      await deletePromise;
    }
  });
});
