import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
	testDir: "./tests",
	timeout: 30000,
	webServer: {
		command: "pnpm run dev",
		port: 5173,
		timeout: 120000,
		reuseExistingServer: true,
	},
	use: {
		baseURL: "http://localhost:5173",
		trace: "retain-on-failure",
		screenshot: "on",
		video: "on",
	},
	reporter: "html",
};

export default config;
