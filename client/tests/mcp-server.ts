import { createServer } from '@microsoft/mcp';
import { test as base, Browser, BrowserContext, Page } from '@playwright/test';

// Define our fixtures
type MCPFixtures = {
  mcpBrowser: Browser;
  mcpContext: BrowserContext;
  mcpPage: Page;
};

// Extend the base test with MCP fixtures
export const test = base.extend<MCPFixtures>({
  mcpBrowser: async ({ browser }, use) => {
    // Create MCP server for debugging
    const mcpServer = await createServer({
      name: 'Playwright Debug Server',
      version: '1.0.0',
      capabilities: {
        debug: true,
        breakpoints: true,
        networkIntercept: true,
        stateInspection: true,
      },
    });

    // Launch browser with MCP debugging enabled
    const mcpBrowser = await browser.launch({
      args: [`--remote-debugging-port=9222`],
    });

    await use(mcpBrowser);
    await mcpServer.close();
  },

  mcpContext: async ({ mcpBrowser }, use) => {
    // Create a context with MCP debugging enabled
    const context = await mcpBrowser.newContext({
      recordVideo: { dir: 'test-results/videos/' },
    });

    await context.route('**/*', async (route) => {
      // Enable network interception for debugging
      const request = route.request();
      console.log(`[MCP] ${request.method()} ${request.url()}`);
      await route.continue();
    });

    await use(context);
    await context.close();
  },

  mcpPage: async ({ mcpContext }, use) => {
    // Create a page with MCP debugging enabled
    const page = await mcpContext.newPage();
    
    // Enable page event logging
    page.on('console', msg => {
      console.log(`[MCP Console] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.error(`[MCP Error] ${error.message}`);
    });

    await use(page);
  },
});
