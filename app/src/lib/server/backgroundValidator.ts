import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateDriverStatusWithData } from './driverLicenceValidator';

/**
 * Background validation service for driver licenses
 *
 * NOTE: Automatic validation is now handled by the dedicated validation worker.
 * This module only contains the manual revalidateDriver function for on-demand validation.
 *
 * For automatic validation:
 * - New drivers are saved with status=2 (pending)
 * - The validation worker continuously polls for pending drivers
 * - Worker validates one driver at a time
 */

/**
 * Re-validates a driver (can be called from an API endpoint for manual revalidation)
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

		// Validate the driver license and get full data
		const validationResult = await validateDriverStatusWithData(
			driver.name,
			driver.surname,
			driver.documentSerialNumber
		);

		// Get existing verification history or create new array
		const existingHistory = (driver.verificationHistory as unknown[]) || [];

		// Add new verification result to history
		const updatedHistory = [
			...existingHistory,
			{
				timestamp: validationResult.timestamp,
				isValid: validationResult.isValid,
				data: validationResult.data
			}
		];

		// Update the driver's status and verification history
		await db
			.update(table.driver)
			.set({
				status: validationResult.isValid ? 1 : 0,
				verificationHistory: updatedHistory
			})
			.where(eq(table.driver.id, driverId));

		return validationResult.isValid;
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
