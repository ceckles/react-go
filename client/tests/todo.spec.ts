import { expect, test } from "@playwright/test";

test("basic todo workflow", async ({ page }) => {
	await page.goto("/");

	// Add a todo
	await page.getByTestId("todo-input").fill("Test Todo Item");
	await page.getByTestId("add-todo-button").click();

	// Check if todo is added
	const todoItem = page.getByTestId("todo-item").first();
	await expect(todoItem).toBeVisible();
	await expect(todoItem).toContainText("Test Todo Item");
	await expect(todoItem).toContainText("In Progress");

	// Complete todo
	await todoItem.getByTestId("todo-checkbox").click();
	await expect(todoItem).toContainText("Done");

	// Delete todo
	await todoItem.getByTestId("delete-todo-button").click();
	await expect(page.getByTestId("todo-item")).toHaveCount(0);
});

test("validation errors", async ({ page }) => {
	await page.goto("/");

	// Try to add empty todo
	await page.getByTestId("add-todo-button").click();

	// Alert should appear (since we're using window.alert)
	page.on("dialog", async (dialog) => {
		expect(dialog.message()).toContain("Body is required");
		await dialog.accept();
	});
});
