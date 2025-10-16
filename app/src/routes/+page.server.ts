import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

// Function to validate driver license
async function validateLicense(documentSerialNumber: string): Promise<boolean> {
	// For now, always return true
	// In the future, this would call an external API or validation service
	return true;
}

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	
	// If not logged in, return null user and empty drivers array
	if (!user) {
		return { user: null, drivers: [] };
	}
	
	// Fetch all drivers for the current user
	const drivers = await db
		.select()
		.from(table.driver)
		.where(eq(table.driver.userId, user.id))
		.orderBy(desc(table.driver.createdAt));
	
	return { user, drivers };
};

export const actions: Actions = {
	addDriver: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name');
		const surname = formData.get('surname');
		const documentSerialNumber = formData.get('documentSerialNumber');

		// Validate inputs
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return fail(400, { message: 'Name is required' });
		}
		if (!surname || typeof surname !== 'string' || surname.trim().length === 0) {
			return fail(400, { message: 'Surname is required' });
		}
		if (
			!documentSerialNumber ||
			typeof documentSerialNumber !== 'string' ||
			documentSerialNumber.trim().length === 0
		) {
			return fail(400, { message: 'Document serial number is required' });
		}

		try {
			// Validate the license
			const isValid = await validateLicense(documentSerialNumber.trim());
			
			await db.insert(table.driver).values({
				name: name.trim(),
				surname: surname.trim(),
				documentSerialNumber: documentSerialNumber.trim(),
				status: isValid ? 1 : 0,
				userId: event.locals.user.id,
				createdAt: new Date()
			});

			return { success: true };
		} catch (error) {
			return fail(500, { message: 'Failed to add driver' });
		}
	},
	updateDriver: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const driverId = formData.get('driverId');
		const name = formData.get('name');
		const surname = formData.get('surname');
		const documentSerialNumber = formData.get('documentSerialNumber');

		if (!driverId || typeof driverId !== 'string') {
			return fail(400, { message: 'Invalid driver ID' });
		}

		// Validate inputs
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return fail(400, { message: 'Name is required' });
		}
		if (!surname || typeof surname !== 'string' || surname.trim().length === 0) {
			return fail(400, { message: 'Surname is required' });
		}
		if (
			!documentSerialNumber ||
			typeof documentSerialNumber !== 'string' ||
			documentSerialNumber.trim().length === 0
		) {
			return fail(400, { message: 'Document serial number is required' });
		}

		try {
			// Validate the license again
			const isValid = await validateLicense(documentSerialNumber.trim());

			// Update only if the driver belongs to the current user
			await db
				.update(table.driver)
				.set({
					name: name.trim(),
					surname: surname.trim(),
					documentSerialNumber: documentSerialNumber.trim(),
					status: isValid ? 1 : 0
				})
				.where(
					and(
						eq(table.driver.id, parseInt(driverId)),
						eq(table.driver.userId, event.locals.user.id)
					)
				);

			return { success: true };
		} catch (error) {
			return fail(500, { message: 'Failed to update driver' });
		}
	},
	deleteDriver: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const driverId = formData.get('driverId');

		if (!driverId || typeof driverId !== 'string') {
			return fail(400, { message: 'Invalid driver ID' });
		}

		try {
			// Delete only if the driver belongs to the current user
			await db
				.delete(table.driver)
				.where(
					and(
						eq(table.driver.id, parseInt(driverId)),
						eq(table.driver.userId, event.locals.user.id)
					)
				);

			return { success: true };
		} catch (error) {
			return fail(500, { message: 'Failed to delete driver' });
		}
	},
	importDrivers: async (event) => {
		if (!event.locals.user) {
			return fail(401, { importError: true, importMessage: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const csvFile = formData.get('csvFile');

		if (!csvFile || !(csvFile instanceof File)) {
			return fail(400, { importError: true, importMessage: 'No file uploaded' });
		}

		if (csvFile.type !== 'text/csv' && !csvFile.name.endsWith('.csv')) {
			return fail(400, { importError: true, importMessage: 'File must be a CSV' });
		}

		try {
			const text = await csvFile.text();
			const lines = text.split('\n').filter(line => line.trim());
			
			if (lines.length < 2) {
				return fail(400, { importError: true, importMessage: 'CSV file is empty or invalid' });
			}

			// Skip header row
			const dataLines = lines.slice(1);
			let successCount = 0;
			let errorCount = 0;

			for (const line of dataLines) {
				// Parse CSV line (simple implementation)
				const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
				
				if (values.length < 3) {
					errorCount++;
					continue;
				}

				const [name, surname, documentSerialNumber] = values;

				if (!name || !surname || !documentSerialNumber) {
					errorCount++;
					continue;
				}

				try {
					const isValid = await validateLicense(documentSerialNumber);
					
					await db.insert(table.driver).values({
						name: name.trim(),
						surname: surname.trim(),
						documentSerialNumber: documentSerialNumber.trim(),
						status: isValid ? 1 : 0,
						userId: event.locals.user.id,
						createdAt: new Date()
					});
					
					successCount++;
				} catch (error) {
					errorCount++;
				}
			}

			return {
				importSuccess: true,
				importMessage: `Successfully imported ${successCount} driver(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`
			};
		} catch (error) {
			return fail(500, { importError: true, importMessage: 'Failed to process CSV file' });
		}
	},
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/');
	}
};

function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, '/login');
	}

	return locals.user;
}
