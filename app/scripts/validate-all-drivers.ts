#!/usr/bin/env bun
/**
 * CLI tool to validate all drivers in the database
 *
 * Usage:
 *   bun run scripts/validate-all-drivers.ts
 *   or
 *   tsx scripts/validate-all-drivers.ts
 *
 * Options:
 *   --user-id <id>       Only validate drivers for a specific user
 *   --status <status>    Only validate drivers with specific status (0=invalid, 1=valid, 2=pending)
 *   --delay <ms>         Delay between validations in milliseconds (default: 2000)
 *   --concurrency <num>  Maximum concurrent validations (default: 1, max: 3)
 *   --dry-run            Show what would be validated without actually validating
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as table from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { validateDriverStatusWithData } from '../src/lib/server/driverLicenceValidator.js';

// Create standalone database connection
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'sprawdzaniekierowcow';
const DB_USERNAME = process.env.DB_USERNAME || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

const connectionString = `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
const client = mysql.createPool(connectionString);
const db = drizzle(client, { schema: table, mode: 'default' });

interface CliOptions {
	userId?: string;
	status?: number;
	delay: number;
	concurrency: number;
	dryRun: boolean;
}

// Parse command line arguments
function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		delay: 2000,
		concurrency: 1,
		dryRun: false
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--user-id' && i + 1 < args.length) {
			options.userId = args[++i];
		} else if (arg === '--status' && i + 1 < args.length) {
			options.status = parseInt(args[++i]);
		} else if (arg === '--delay' && i + 1 < args.length) {
			options.delay = parseInt(args[++i]);
		} else if (arg === '--concurrency' && i + 1 < args.length) {
			const concurrency = parseInt(args[++i]);
			options.concurrency = Math.min(Math.max(concurrency, 1), 3); // Clamp between 1 and 3
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			console.log(`
Usage: bun run scripts/validate-all-drivers.ts [options]

Options:
  --user-id <id>       Only validate drivers for a specific user
  --status <status>    Only validate drivers with specific status (0=invalid, 1=valid, 2=pending)
  --delay <ms>         Delay between validations in milliseconds (default: 2000)
  --concurrency <num>  Maximum concurrent validations (default: 1, max: 3)
  --dry-run            Show what would be validated without actually validating
  --help, -h           Show this help message
			`);
			process.exit(0);
		}
	}

	return options;
}

// Format status as human-readable string
function formatStatus(status: number): string {
	switch (status) {
		case 0:
			return 'INVALID';
		case 1:
			return 'VALID';
		case 2:
			return 'PENDING';
		default:
			return 'UNKNOWN';
	}
}

// Main function
async function main() {
	console.log('🚗 Driver License Validation CLI\n');

	const options = parseArgs();

	console.log('Options:');
	console.log(`  User ID filter: ${options.userId || 'All users'}`);
	console.log(
		`  Status filter: ${options.status !== undefined ? formatStatus(options.status) : 'All statuses'}`
	);
	console.log(`  Delay: ${options.delay}ms`);
	console.log(`  Concurrency: ${options.concurrency}`);
	console.log(`  Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
	console.log('');

	// Build query
	let query = db.select().from(table.driver);

	if (options.userId) {
		query = query.where(eq(table.driver.userId, options.userId)) as typeof query;
	}

	if (options.status !== undefined) {
		query = query.where(eq(table.driver.status, options.status)) as typeof query;
	}

	// Fetch drivers
	console.log('📊 Fetching drivers from database...');
	const drivers = await query;
	console.log(`Found ${drivers.length} driver(s) to validate\n`);

	if (drivers.length === 0) {
		console.log('✨ No drivers found. Nothing to do!');
		await client.end();
		process.exit(0);
	}

	if (options.dryRun) {
		console.log('📋 Drivers that would be validated:');
		drivers.forEach((driver, index) => {
			console.log(
				`  ${index + 1}. ID: ${driver.id} | ${driver.name} ${driver.surname} | ${driver.documentSerialNumber} | Status: ${formatStatus(driver.status)}`
			);
		});
		console.log('\n✅ Dry run complete. Use without --dry-run to actually validate.');
		await client.end();
		process.exit(0);
	}

	// Validate each driver with concurrency control
	let validCount = 0;
	let invalidCount = 0;
	let errorCount = 0;

	console.log('🔍 Starting validation...\n');

	// Function to validate a single driver
	async function validateDriver(driver: (typeof drivers)[0], index: number) {
		const progress = `[${index + 1}/${drivers.length}]`;
		const timestamp = new Date().toISOString();
		const startTime = Date.now();

		console.log(
			`${progress} Validating: ${driver.name} ${driver.surname} (${driver.documentSerialNumber})...`
		);
		console.log(`  ├─ Driver ID: ${driver.id}`);
		console.log(`  ├─ User ID: ${driver.userId}`);
		console.log(`  ├─ Current Status: ${formatStatus(driver.status)}`);
		console.log(`  ├─ Started at: ${timestamp}`);

		try {
			// Set status to pending
			await db.update(table.driver).set({ status: 2 }).where(eq(table.driver.id, driver.id));
			console.log(`  ├─ Status set to PENDING`);

			// Validate the driver with full data (includes API URL)
			// Pass existing API URL to enable fast path validation
			const validationResult = await validateDriverStatusWithData(
				driver.name,
				driver.surname,
				driver.documentSerialNumber,
				driver.validationApiUrl
			);
			console.log(`  ├─ Validation result: ${validationResult.isValid ? 'VALID' : 'INVALID'}`);
			if (driver.validationApiUrl) {
				console.log(`  ├─ Used fast path: ${validationResult.apiUrl === driver.validationApiUrl}`);
			}

			// Get existing verification history or create new array
			const existingHistory = (driver.verificationHistory as unknown[]) || [];

			// Add new verification result to history
			const updatedHistory = [
				...existingHistory,
				{
					timestamp: validationResult.timestamp,
					isValid: validationResult.isValid,
					data: validationResult.data,
					usedDirectApi: !!driver.validationApiUrl
				}
			];

			// Update status, verification history, and API URL based on validation result
			const newStatus = validationResult.isValid ? 1 : 0;
			await db
				.update(table.driver)
				.set({
					status: newStatus,
					verificationHistory: updatedHistory,
					validationApiUrl: validationResult.apiUrl
				})
				.where(eq(table.driver.id, driver.id));

			const duration = Date.now() - startTime;
			console.log(`  ├─ Status updated to: ${formatStatus(newStatus)}`);
			if (validationResult.apiUrl) {
				console.log(`  ├─ API URL stored for fast validation`);
			}
			console.log(`  └─ Duration: ${duration}ms`);

			if (validationResult.isValid) {
				validCount++;
				console.log(`${progress} ✅ VALID - ${driver.name} ${driver.surname}\n`);
			} else {
				invalidCount++;
				console.log(`${progress} ❌ INVALID - ${driver.name} ${driver.surname}\n`);
			}
		} catch (error) {
			errorCount++;
			const duration = Date.now() - startTime;
			console.error(`  ├─ Validation failed after ${duration}ms`);
			console.error(`${progress} ⚠️  ERROR - ${driver.name} ${driver.surname}`);
			console.error(`  └─ Error: ${error instanceof Error ? error.message : String(error)}\n`);

			// Mark as invalid on error
			try {
				await db.update(table.driver).set({ status: 0 }).where(eq(table.driver.id, driver.id));
			} catch (updateError) {
				console.error(`  Failed to update status: ${updateError}`);
			}
		}
	}

	// Process drivers with concurrency control
	if (options.concurrency === 1) {
		// Sequential processing (original behavior)
		for (let i = 0; i < drivers.length; i++) {
			await validateDriver(drivers[i], i);

			// Delay between validations to avoid overwhelming the API
			if (i < drivers.length - 1 && options.delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, options.delay));
			}
		}
	} else {
		// Concurrent processing with limit
		const promises: Promise<void>[] = [];
		let currentIndex = 0;

		while (currentIndex < drivers.length) {
			// Start up to 'concurrency' validations
			while (promises.length < options.concurrency && currentIndex < drivers.length) {
				const index = currentIndex;
				const promise = validateDriver(drivers[index], index).then(async () => {
					// Remove completed promise from array
					const idx = promises.indexOf(promise);
					if (idx > -1) {
						promises.splice(idx, 1);
					}

					// Add delay after each validation
					if (options.delay > 0) {
						await new Promise((resolve) => setTimeout(resolve, options.delay));
					}
				});
				promises.push(promise);
				currentIndex++;
			}

			// Wait for at least one to complete before starting more
			if (promises.length > 0) {
				await Promise.race(promises);
			}
		}

		// Wait for all remaining validations to complete
		await Promise.all(promises);
	}

	// Print summary
	console.log('\n' + '='.repeat(60));
	console.log('📊 Validation Summary:');
	console.log('='.repeat(60));
	console.log(`Total drivers processed: ${drivers.length}`);
	console.log(`✅ Valid: ${validCount}`);
	console.log(`❌ Invalid: ${invalidCount}`);
	console.log(`⚠️  Errors: ${errorCount}`);
	console.log('='.repeat(60));
	console.log('\n✨ Validation complete!');

	// Clean up resources
	console.log('\n🧹 Cleaning up...');
	await client.end();
	console.log('✅ Cleanup complete!');
}

// Run the CLI
main()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Fatal error:', error);
		process.exit(1);
	});
