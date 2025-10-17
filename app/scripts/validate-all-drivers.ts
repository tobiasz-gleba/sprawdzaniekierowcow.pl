#!/usr/bin/env tsx
/**
 * CLI tool to validate all drivers in the database
 * 
 * Usage:
 *   bun run scripts/validate-all-drivers.ts
 *   or
 *   tsx scripts/validate-all-drivers.ts
 * 
 * Options:
 *   --user-id <id>     Only validate drivers for a specific user
 *   --status <status>  Only validate drivers with specific status (0=invalid, 1=valid, 2=pending)
 *   --delay <ms>       Delay between validations in milliseconds (default: 2000)
 *   --dry-run          Show what would be validated without actually validating
 */

import { db } from '../src/lib/server/db/index.js';
import * as table from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { validateDriverStatus } from '../src/lib/server/driverLicenceValidator.js';

interface CliOptions {
	userId?: string;
	status?: number;
	delay: number;
	dryRun: boolean;
}

// Parse command line arguments
function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		delay: 2000,
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
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			console.log(`
Usage: bun run scripts/validate-all-drivers.ts [options]

Options:
  --user-id <id>     Only validate drivers for a specific user
  --status <status>  Only validate drivers with specific status (0=invalid, 1=valid, 2=pending)
  --delay <ms>       Delay between validations in milliseconds (default: 2000)
  --dry-run          Show what would be validated without actually validating
  --help, -h         Show this help message
			`);
			process.exit(0);
		}
	}

	return options;
}

// Format status as human-readable string
function formatStatus(status: number): string {
	switch (status) {
		case 0: return 'INVALID';
		case 1: return 'VALID';
		case 2: return 'PENDING';
		default: return 'UNKNOWN';
	}
}

// Main function
async function main() {
	console.log('🚗 Driver License Validation CLI\n');

	const options = parseArgs();

	console.log('Options:');
	console.log(`  User ID filter: ${options.userId || 'All users'}`);
	console.log(`  Status filter: ${options.status !== undefined ? formatStatus(options.status) : 'All statuses'}`);
	console.log(`  Delay: ${options.delay}ms`);
	console.log(`  Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
	console.log('');

	// Build query
	let query = db.select().from(table.driver);

	if (options.userId) {
		query = query.where(eq(table.driver.userId, options.userId)) as any;
	}

	if (options.status !== undefined) {
		query = query.where(eq(table.driver.status, options.status)) as any;
	}

	// Fetch drivers
	console.log('📊 Fetching drivers from database...');
	const drivers = await query;
	console.log(`Found ${drivers.length} driver(s) to validate\n`);

	if (drivers.length === 0) {
		console.log('✨ No drivers found. Nothing to do!');
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
		process.exit(0);
	}

	// Validate each driver
	let validCount = 0;
	let invalidCount = 0;
	let errorCount = 0;

	console.log('🔍 Starting validation...\n');

	for (let i = 0; i < drivers.length; i++) {
		const driver = drivers[i];
		const progress = `[${i + 1}/${drivers.length}]`;

		console.log(
			`${progress} Validating: ${driver.name} ${driver.surname} (${driver.documentSerialNumber})...`
		);

		try {
			// Set status to pending
			await db
				.update(table.driver)
				.set({ status: 2 })
				.where(eq(table.driver.id, driver.id));

			// Validate the driver
			const isValid = await validateDriverStatus(
				driver.name,
				driver.surname,
				driver.documentSerialNumber
			);

			// Update status based on validation result
			const newStatus = isValid ? 1 : 0;
			await db
				.update(table.driver)
				.set({ status: newStatus })
				.where(eq(table.driver.id, driver.id));

			if (isValid) {
				validCount++;
				console.log(`${progress} ✅ VALID - ${driver.name} ${driver.surname}`);
			} else {
				invalidCount++;
				console.log(`${progress} ❌ INVALID - ${driver.name} ${driver.surname}`);
			}
		} catch (error) {
			errorCount++;
			console.error(`${progress} ⚠️  ERROR - ${driver.name} ${driver.surname}`);
			console.error(`  ${error instanceof Error ? error.message : String(error)}`);

			// Mark as invalid on error
			try {
				await db
					.update(table.driver)
					.set({ status: 0 })
					.where(eq(table.driver.id, driver.id));
			} catch (updateError) {
				console.error(`  Failed to update status: ${updateError}`);
			}
		}

		// Delay between validations to avoid overwhelming the API
		if (i < drivers.length - 1 && options.delay > 0) {
			await new Promise(resolve => setTimeout(resolve, options.delay));
		}
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

