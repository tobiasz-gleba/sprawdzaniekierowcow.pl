import { chromium, type Browser, type BrowserContext } from 'playwright';

/**
 * Checks driver license information from the Polish government's
 * Central Driver Registry (Centralna Ewidencja Kierowców - CEK)
 *
 * Worker processes one driver at a time, so we create a fresh browser for each validation.
 * This is simpler and safer than pooling - no shared state, clean start each time.
 *
 * @param name - Driver's first name
 * @param surname - Driver's surname
 * @param documentNumber - Document serial number (e.g., "AA004547")
 * @returns Promise<any> - Raw JSON response from the government API or null if error
 */
export async function checkDriverLicence(
	name: string,
	surname: string,
	documentNumber: string
): Promise<any> {
	let browser: Browser | null = null;
	let context: BrowserContext | null = null;

	try {
		// Create a fresh browser for this validation (worker processes one at a time)
		browser = await chromium.launch({
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

		context = await browser.newContext({
			locale: 'pl-PL',
			timezoneId: 'Europe/Warsaw',
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		});

		const page = await context.newPage();

		// Navigate to the government form with longer timeout
		const url =
			'https://moj.gov.pl/uslugi/engine/ng/index?xFormsAppName=UprawnieniaKierowcow&xFormsOrigin=EXTERNAL';
		await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

		// Wait for the form to load
		await page.waitForLoadState('domcontentloaded');
		await page.waitForTimeout(3000); // Increased wait time

		// Fill the form fields with timeout for each action
		await page.locator('input#imiePierwsze').fill(name, { timeout: 10000 });
		await page.locator('input#nazwisko').fill(surname, { timeout: 10000 });
		await page.locator('input#seriaNumerBlankietuDruku').fill(documentNumber, { timeout: 10000 });

		// Wait for button to be enabled (government website validates form first)
		const submitButton = page.locator('button.btn.btn-primary:has-text("Sprawdź uprawnienia")');
		await submitButton.waitFor({ state: 'visible', timeout: 10000 });

		// Wait for button to be enabled (not disabled)
		await page.waitForFunction(
			(selector) => {
				const button = document.querySelector(selector);
				return button && !button.hasAttribute('disabled');
			},
			'button.btn.btn-primary',
			{ timeout: 15000 }
		);

		// Set up promise to capture API response ONLY after button is ready
		// This prevents unhandled promise rejection if validation fails above
		const apiResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/data/driver-permissions') && response.status() === 200,
			{ timeout: 60000 } // Increased to 60 seconds
		);

		// Now click the enabled button
		await submitButton.click({ timeout: 5000 });

		// Wait for and capture the API response
		const apiResponse = await apiResponsePromise;
		const jsonData = await apiResponse.json();

		return jsonData;
	} catch (error) {
		// Log error but don't crash - worker should continue processing
		if (error instanceof Error) {
			if (error.name === 'TimeoutError') {
				console.error(`Timeout checking driver licence for ${name} ${surname}:`, error.message);
			} else {
				console.error(`Error checking driver licence for ${name} ${surname}:`, error.message);
			}
		} else {
			console.error(`Unknown error checking driver licence for ${name} ${surname}:`, error);
		}

		// Return null to mark as invalid - worker continues
		return null;
	} finally {
		// Always close browser completely (no pooling - fresh browser each time)
		if (browser) {
			try {
				await browser.close();
			} catch (closeError) {
				console.error('Error closing browser:', closeError);
			}
		}
	}
}

/**
 * Validates driver status by checking if the document status is "Wydany"
 * and the expiry date has not passed
 *
 * @param name - Driver's first name
 * @param surname - Driver's surname
 * @param documentNumber - Document serial number
 * @returns Promise<boolean> - true if status is "Wydany" and not expired, false otherwise
 */
export async function validateDriverStatus(
	name: string,
	surname: string,
	documentNumber: string
): Promise<boolean> {
	try {
		// Get the driver license data
		const data = await checkDriverLicence(name, surname, documentNumber);

		if (!data || !data.dokumentPotwierdzajacyUprawnienia) {
			return false;
		}

		const document = data.dokumentPotwierdzajacyUprawnienia;

		// Check document status - must be "Wydany" (Issued)
		const status = document.stanDokumentu?.stanDokumentu?.wartosc;
		if (status !== 'Wydany') {
			return false;
		}

		// Check if document has expired
		const expiryDate = document.dataWaznosci; // Format: YYYY-MM-DD
		if (expiryDate) {
			const expiry = new Date(expiryDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

			if (expiry < today) {
				return false; // Document has expired
			}
		}

		// All checks passed
		return true;
	} catch (error) {
		console.error('Error validating driver status:', error);
		return false;
	}
}

/**
 * Validates driver status and returns full result including JSON data
 *
 * @param name - Driver's first name
 * @param surname - Driver's surname
 * @param documentNumber - Document serial number
 * @returns Promise with validation result and full JSON data
 */
export async function validateDriverStatusWithData(
	name: string,
	surname: string,
	documentNumber: string
): Promise<{ isValid: boolean; data: any; timestamp: string }> {
	const timestamp = new Date().toISOString();

	try {
		// Get the driver license data
		const data = await checkDriverLicence(name, surname, documentNumber);

		if (!data || !data.dokumentPotwierdzajacyUprawnienia) {
			return {
				isValid: false,
				data: data || { error: 'No data returned' },
				timestamp
			};
		}

		const document = data.dokumentPotwierdzajacyUprawnienia;

		// Check document status - must be "Wydany" (Issued)
		const status = document.stanDokumentu?.stanDokumentu?.wartosc;
		if (status !== 'Wydany') {
			return { isValid: false, data, timestamp };
		}

		// Check if document has expired
		const expiryDate = document.dataWaznosci; // Format: YYYY-MM-DD
		if (expiryDate) {
			const expiry = new Date(expiryDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

			if (expiry < today) {
				return { isValid: false, data, timestamp };
			}
		}

		// All checks passed
		return { isValid: true, data, timestamp };
	} catch (error) {
		console.error('Error validating driver status:', error);
		return {
			isValid: false,
			data: { error: String(error) },
			timestamp
		};
	}
}
