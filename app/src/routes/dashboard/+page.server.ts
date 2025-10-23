import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and, asc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { scheduleValidation, scheduleBatchValidation, revalidateDriver } from '$lib/server/backgroundValidator';

export const load: PageServerLoad = async (event) => {
	// Require authentication
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	// Don't cache dashboard (dynamic content)
	event.setHeaders({
		'Cache-Control': 'private, no-cache, no-store, must-revalidate'
	});

	// Fetch all drivers for the current user
	// Sort by status ascending (0/false first, then 1/true) and then by creation date descending
	const drivers = await db
		.select()
		.from(table.driver)
		.where(eq(table.driver.userId, event.locals.user.id))
		.orderBy(asc(table.driver.status), desc(table.driver.createdAt));

	return { user: event.locals.user, drivers };
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
			// Insert driver with pending status (2)
			const result = await db.insert(table.driver).values({
				name: name.trim(),
				surname: surname.trim(),
				documentSerialNumber: documentSerialNumber.trim(),
				status: 2, // pending
				userId: event.locals.user.id,
				createdAt: new Date()
			});

			// Schedule background validation
			const insertId = Number(result[0].insertId);
			scheduleValidation(insertId);

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
			// Update with pending status and schedule background validation
			await db
				.update(table.driver)
				.set({
					name: name.trim(),
					surname: surname.trim(),
					documentSerialNumber: documentSerialNumber.trim(),
					status: 2 // pending
				})
				.where(
					and(
						eq(table.driver.id, parseInt(driverId)),
						eq(table.driver.userId, event.locals.user.id)
					)
				);

			// Schedule background validation
			scheduleValidation(parseInt(driverId));

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
			const lines = text.split('\n').filter((line) => line.trim());

			if (lines.length < 2) {
				return fail(400, { importError: true, importMessage: 'CSV file is empty or invalid' });
			}

			// Skip header row
			const dataLines = lines.slice(1);
			let successCount = 0;
			let errorCount = 0;
			const insertedIds: number[] = [];

			for (const line of dataLines) {
				// Parse CSV line (simple implementation)
				const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));

				if (values.length < 3) {
					errorCount++;
					continue;
				}

				// Support both 3-column format (old) and 4-column format (with Status) from export
				// Format: Imię, Nazwisko, Numer Seryjny Dokumentu, [Status - optional, will be ignored]
				const [name, surname, documentSerialNumber] = values;

				if (!name || !surname || !documentSerialNumber) {
					errorCount++;
					continue;
				}

				try {
					// Insert with pending status
					const result = await db.insert(table.driver).values({
						name: name.trim(),
						surname: surname.trim(),
						documentSerialNumber: documentSerialNumber.trim(),
						status: 2, // pending
						userId: event.locals.user.id,
						createdAt: new Date()
					});

					const insertId = Number(result[0].insertId);
					insertedIds.push(insertId);
					successCount++;
				} catch (error) {
					errorCount++;
				}
			}

			// Schedule batch validation in the background
			if (insertedIds.length > 0) {
				scheduleBatchValidation(insertedIds);
			}

			return {
				importSuccess: true,
				importMessage: `Successfully imported ${successCount} driver(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}. Validation in progress...`
			};
		} catch (error) {
			return fail(500, { importError: true, importMessage: 'Failed to process CSV file' });
		}
	},
	revalidateDriver: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const driverId = formData.get('driverId');

		if (!driverId || typeof driverId !== 'string') {
			return fail(400, { message: 'Invalid driver ID' });
		}

		try {
			// Verify the driver belongs to the current user
			const drivers = await db
				.select()
				.from(table.driver)
				.where(
					and(
						eq(table.driver.id, parseInt(driverId)),
						eq(table.driver.userId, event.locals.user.id)
					)
				)
				.limit(1);

			if (drivers.length === 0) {
				return fail(404, { message: 'Driver not found' });
			}

			// Re-validate the driver
			const isValid = await revalidateDriver(parseInt(driverId));

			return { 
				success: true, 
				message: isValid ? 'Driver is valid' : 'Driver is invalid'
			};
		} catch (error) {
			return fail(500, { message: 'Failed to revalidate driver' });
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

