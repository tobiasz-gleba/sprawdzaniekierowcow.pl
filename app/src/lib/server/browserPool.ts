import { chromium, type Browser } from 'playwright';

/**
 * Browser pool manager to reuse browser instances
 * This reduces memory consumption by reusing a single browser instance
 * across multiple validations
 */
class BrowserPool {
	private browser: Browser | null = null;
	private isInitializing = false;
	private initPromise: Promise<Browser> | null = null;
	private lastUsed = Date.now();
	private readonly IDLE_TIMEOUT = 60000; // Close browser after 1 minute of inactivity
	private idleTimer: NodeJS.Timeout | null = null;

	/**
	 * Get a browser instance from the pool
	 * Creates a new browser if none exists
	 */
	async getBrowser(): Promise<Browser> {
		// Clear idle timer since browser is being used
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);
			this.idleTimer = null;
		}

		// If browser exists and is connected, return it
		if (this.browser && this.browser.isConnected()) {
			this.lastUsed = Date.now();
			return this.browser;
		}

		// If browser is being initialized, wait for it
		if (this.isInitializing && this.initPromise) {
			return this.initPromise;
		}

		// Initialize new browser
		this.isInitializing = true;
		this.initPromise = this.createBrowser();

		try {
			this.browser = await this.initPromise;
			this.lastUsed = Date.now();
			return this.browser;
		} finally {
			this.isInitializing = false;
			this.initPromise = null;
		}
	}

	/**
	 * Create a new browser instance with optimized settings
	 */
	private async createBrowser(): Promise<Browser> {
		console.log('Creating new browser instance...');

		const browser = await chromium.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage', // Overcome limited resource problems
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				'--disable-gpu',
				'--disable-software-rasterizer',
				'--disable-extensions'
			]
		});

		console.log('Browser instance created');
		return browser;
	}

	/**
	 * Release browser after use and schedule idle timeout
	 */
	releaseBrowser(): void {
		this.lastUsed = Date.now();

		// Schedule browser closure after idle timeout
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);
		}

		this.idleTimer = setTimeout(() => {
			this.closeBrowser().catch((error) => {
				console.error('Error closing idle browser:', error);
			});
		}, this.IDLE_TIMEOUT);
	}

	/**
	 * Close the browser instance
	 */
	async closeBrowser(): Promise<void> {
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);
			this.idleTimer = null;
		}

		if (this.browser) {
			try {
				console.log('Closing browser instance...');
				await this.browser.close();
				console.log('Browser instance closed');
			} catch (error) {
				console.error('Error closing browser:', error);
			} finally {
				this.browser = null;
			}
		}
	}

	/**
	 * Force close browser immediately
	 */
	async forceClose(): Promise<void> {
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);
			this.idleTimer = null;
		}

		if (this.browser) {
			try {
				await this.browser.close();
			} catch (error) {
				console.error('Error force closing browser:', error);
			} finally {
				this.browser = null;
			}
		}
	}
}

// Export singleton instance
export const browserPool = new BrowserPool();
