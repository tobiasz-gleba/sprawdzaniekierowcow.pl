import { chromium, type Browser } from 'playwright';

/**
 * Checks driver license information from the Polish government's
 * Central Driver Registry (Centralna Ewidencja Kierowców - CEK)
 * 
 * @param name - Driver's first name
 * @param surname - Driver's surname
 * @param documentNumber - Document serial number (e.g., "AA004967")
 * @returns Promise<any> - Raw JSON response from the government API or null if error
 */
export async function checkDriverLicence(
	name: string,
	surname: string,
	documentNumber: string
): Promise<any> {
	let browser: Browser | null = null;

	try {
		// Launch browser in headless mode
		browser = await chromium.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});

		const context = await browser.newContext({
			locale: 'pl-PL',
			timezoneId: 'Europe/Warsaw',
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		});

		const page = await context.newPage();

		// Set up a promise to capture the API response
		const apiResponsePromise = page.waitForResponse(
			response => response.url().includes('/data/driver-permissions') && response.status() === 200,
			{ timeout: 15000 }
		);

		// Navigate to the government form
		const url = 'https://moj.gov.pl/uslugi/engine/ng/index?xFormsAppName=UprawnieniaKierowcow&xFormsOrigin=EXTERNAL';
		await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

		// Wait for the form to load
		await page.waitForLoadState('domcontentloaded');
		await page.waitForTimeout(2000);

		// Fill the form fields
		await page.locator('input#imiePierwsze').fill(name);
		await page.locator('input#nazwisko').fill(surname);
		await page.locator('input#seriaNumerBlankietuDruku').fill(documentNumber);

		// Submit the form
		await page.locator('button.btn.btn-primary:has-text("Sprawdź uprawnienia")').click();

		// Wait for and capture the API response
		const apiResponse = await apiResponsePromise;
		const jsonData = await apiResponse.json();

		await browser.close();

		return jsonData;

	} catch (error) {
		if (browser) {
			await browser.close();
		}
		console.error('Error checking driver licence:', error);
		return null;
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

