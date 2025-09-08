import { test as base, chromium } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';

// Define our debug fixtures
type DebugFixtures = {
  debugBrowser: Browser;
  debugContext: BrowserContext;
  debugPage: Page;
};

// Extend the base test with debug fixtures
export const test = base.extend<DebugFixtures>({
  debugBrowser: async ({}, use) => {
    // Launch browser with CDP debugging enabled
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222'],
    });

    await use(browser);
    await browser.close();
  },

  debugContext: async ({ debugBrowser }, use) => {
    // Create a context with debugging enabled
    const context = await debugBrowser.newContext({
      recordVideo: { dir: 'test-results/videos/' },
    });

    // Enable CDP session for debugging
    const cdpSession = await context.newCDPSession(await context.newPage());
    
    // Enable network debugging
    await cdpSession.send('Network.enable');
    cdpSession.on('Network.requestWillBeSent', params => {
      console.log(`[Debug] Request: ${params.request.method} ${params.request.url}`);
    });

    // Enable runtime debugging
    await cdpSession.send('Runtime.enable');
    cdpSession.on('Runtime.consoleAPICalled', params => {
      console.log(`[Debug] Console: ${params.type} - ${params.args.map(arg => arg.value).join(' ')}`);
    });

    await use(context);
    await context.close();
  },

  debugPage: async ({ debugContext }, use) => {
    const page = await debugContext.newPage();

    // Setup debug listeners
    page.on('console', msg => {
      console.log(`[Debug Console] ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.error(`[Debug Error] ${error.message}`);
    });

    page.on('request', request => {
      console.log(`[Debug Request] ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      console.log(`[Debug Response] ${response.status()} ${response.url()}`);
    });

    await use(page);
  },
});
