import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateDriverStatus } from './driverLicenceValidator';

/**
 * Background validation service for driver licenses
 * Validates driver licenses asynchronously and updates their status in the database
 */

/**
 * Validates a single driver and updates their status in the database
 * @param driverId - The ID of the driver to validate
 */
async function validateSingleDriver(driverId: number): Promise<void> {
	try {
		// Fetch the driver from the database
		const drivers = await db
			.select()
			.from(table.driver)
			.where(eq(table.driver.id, driverId))
			.limit(1);

		if (drivers.length === 0) {
			console.error(`Driver with ID ${driverId} not found`);
			return;
		}

		const driver = drivers[0];

		// Validate the driver license
		const isValid = await validateDriverStatus(
			driver.name,
			driver.surname,
			driver.documentSerialNumber
		);

		// Update the driver's status
		await db
			.update(table.driver)
			.set({ status: isValid ? 1 : 0 })
			.where(eq(table.driver.id, driverId));

		console.log(
			`Driver ${driverId} (${driver.name} ${driver.surname}) validated: ${isValid ? 'VALID' : 'INVALID'}`
		);
	} catch (error) {
		console.error(`Error validating driver ${driverId}:`, error);
		// Mark as invalid on error
		try {
			await db.update(table.driver).set({ status: 0 }).where(eq(table.driver.id, driverId));
		} catch (updateError) {
			console.error(`Error updating driver ${driverId} status:`, updateError);
		}
	}
}

/**
 * Schedules validation for a driver in the background
 * This function returns immediately and validation happens asynchronously
 * @param driverId - The ID of the driver to validate
 */
export function scheduleValidation(driverId: number): void {
	// Schedule validation to run after the current operation completes
	setImmediate(() => {
		validateSingleDriver(driverId).catch((error) => {
			console.error(`Failed to schedule validation for driver ${driverId}:`, error);
		});
	});
}

/**
 * Validates multiple drivers in the background
 * @param driverIds - Array of driver IDs to validate
 */
export function scheduleBatchValidation(driverIds: number[]): void {
	setImmediate(async () => {
		for (const driverId of driverIds) {
			try {
				await validateSingleDriver(driverId);
				// Add a small delay between validations to avoid overwhelming the API
				await new Promise((resolve) => setTimeout(resolve, 2000));
			} catch (error) {
				console.error(`Failed to validate driver ${driverId}:`, error);
			}
		}
	});
}

/**
 * Re-validates a driver (can be called from an API endpoint)
 * @param driverId - The ID of the driver to re-validate
 * @returns Promise that resolves to the validation result
 */
export async function revalidateDriver(driverId: number): Promise<boolean> {
	try {
		// Fetch the driver from the database
		const drivers = await db
			.select()
			.from(table.driver)
			.where(eq(table.driver.id, driverId))
			.limit(1);

		if (drivers.length === 0) {
			throw new Error(`Driver with ID ${driverId} not found`);
		}

		const driver = drivers[0];

		// Set status to pending
		await db.update(table.driver).set({ status: 2 }).where(eq(table.driver.id, driverId));

		// Validate the driver license
		const isValid = await validateDriverStatus(
			driver.name,
			driver.surname,
			driver.documentSerialNumber
		);

		// Update the driver's status
		await db
			.update(table.driver)
			.set({ status: isValid ? 1 : 0 })
			.where(eq(table.driver.id, driverId));

		return isValid;
	} catch (error) {
		console.error(`Error re-validating driver ${driverId}:`, error);
		// Mark as invalid on error
		try {
			await db.update(table.driver).set({ status: 0 }).where(eq(table.driver.id, driverId));
		} catch (updateError) {
			console.error(`Error updating driver ${driverId} status:`, updateError);
		}
		return false;
	}
}

