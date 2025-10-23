import { type Browser, type BrowserContext } from 'playwright';
import { browserPool } from './browserPool';

/**
 * Checks driver license information from the Polish government's
 * Central Driver Registry (Centralna Ewidencja Kierowców - CEK)
 *
 * @param name - Driver's first name
 * @param surname - Driver's surname
 * @param documentNumber - Document serial number (e.g., "AA004547")
 * @param retryCount - Number of retries (internal use)
 * @returns Promise<any> - Raw JSON response from the government API or null if error
 */
export async function checkDriverLicence(
	name: string,
	surname: string,
	documentNumber: string,
	retryCount = 0
): Promise<any> {
	const MAX_RETRIES = 2;
	let browser: Browser | null = null;
	let context: BrowserContext | null = null;

	try {
		// Get browser from pool instead of creating new one
		browser = await browserPool.getBrowser();

		context = await browser.newContext({
			locale: 'pl-PL',
			timezoneId: 'Europe/Warsaw',
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		});

		const page = await context.newPage();

		// Set up a promise to capture the API response with longer timeout
		const apiResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/data/driver-permissions') && response.status() === 200,
			{ timeout: 60000 } // Increased to 60 seconds
		);

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

		// Submit the form
		await page
			.locator('button.btn.btn-primary:has-text("Sprawdź uprawnienia")')
			.click({ timeout: 10000 });

		// Wait for and capture the API response
		const apiResponse = await apiResponsePromise;
		const jsonData = await apiResponse.json();

		return jsonData;
	} catch (error) {
		console.error(
			`Error checking driver licence (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`,
			error
		);

		// Retry on timeout errors if we haven't exceeded max retries
		if (retryCount < MAX_RETRIES && error instanceof Error && error.name === 'TimeoutError') {
			console.log(`Retrying validation for ${name} ${surname}...`);
			// Wait a bit before retrying
			await new Promise((resolve) => setTimeout(resolve, 5000));
			return checkDriverLicence(name, surname, documentNumber, retryCount + 1);
		}

		return null;
	} finally {
		// Close the context (not the browser) to free resources
		if (context) {
			try {
				await context.close();
			} catch (closeError) {
				console.error('Error closing browser context:', closeError);
			}
		}

		// Release browser back to pool
		if (browser) {
			browserPool.releaseBrowser();
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
