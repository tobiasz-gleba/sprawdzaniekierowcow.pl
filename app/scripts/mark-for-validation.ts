#!/usr/bin/env bun
/**
 * Mark Drivers for Validation
 *
 * Marks all or selected drivers as pending (status=2) for validation by the worker.
 * This script doesn't validate - it just adds drivers to the queue.
 *
 * Usage:
 *   bun run scripts/mark-for-validation.ts
 *   or
 *   npm run mark:all
 *
 * Options:
 *   --user-id <id>     Only mark drivers for a specific user
 *   --status <status>  Only mark drivers with specific status (0=invalid, 1=valid)
 *   --dry-run          Show what would be marked without actually marking
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as table from '../src/lib/server/db/schema.js';
import { eq, and, ne } from 'drizzle-orm';

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
	dryRun: boolean;
}

// Parse command line arguments
function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		dryRun: false
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--user-id' && i + 1 < args.length) {
			options.userId = args[++i];
		} else if (arg === '--status' && i + 1 < args.length) {
			options.status = parseInt(args[++i]);
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			console.log(`
Usage: bun run scripts/mark-for-validation.ts [options]

Options:
  --user-id <id>     Only mark drivers for a specific user
  --status <status>  Only mark drivers with specific status (0=invalid, 1=valid)
  --dry-run          Show what would be marked without actually marking
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
	console.log('🔄 Mark Drivers for Validation\n');

	const options = parseArgs();

	console.log('Options:');
	console.log(`  User ID filter: ${options.userId || 'All users'}`);
	console.log(
		`  Status filter: ${options.status !== undefined ? formatStatus(options.status) : 'All statuses (except pending)'}`
	);
	console.log(`  Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
	console.log('');

	// Build query - exclude already pending drivers
	let query = db.select().from(table.driver).where(ne(table.driver.status, 2));

	if (options.userId) {
		query = query.where(
			and(ne(table.driver.status, 2), eq(table.driver.userId, options.userId))
		) as typeof query;
	}

	if (options.status !== undefined) {
		query = query.where(
			and(eq(table.driver.status, options.status), ne(table.driver.status, 2))
		) as typeof query;
	}

	// Fetch drivers
	console.log('📊 Fetching drivers from database...');
	const drivers = await query;
	console.log(`Found ${drivers.length} driver(s) to mark for validation\n`);

	if (drivers.length === 0) {
		console.log('✨ No drivers found. Nothing to do!');
		await client.end();
		process.exit(0);
	}

	if (options.dryRun) {
		console.log('📋 Drivers that would be marked for validation:');
		drivers.forEach((driver, index) => {
			console.log(
				`  ${index + 1}. ID: ${driver.id} | ${driver.name} ${driver.surname} | ${driver.documentSerialNumber} | Status: ${formatStatus(driver.status)}`
			);
		});
		console.log('\n✅ Dry run complete. Use without --dry-run to actually mark drivers.');
		await client.end();
		process.exit(0);
	}

	// Mark all drivers as pending
	console.log('🔄 Marking drivers as pending...\n');

	let successCount = 0;
	let errorCount = 0;

	for (let i = 0; i < drivers.length; i++) {
		const driver = drivers[i];
		const progress = `[${i + 1}/${drivers.length}]`;

		try {
			await db
				.update(table.driver)
				.set({ status: 2, processing: false })
				.where(eq(table.driver.id, driver.id));

			successCount++;
			console.log(
				`${progress} ✅ Marked driver ${driver.id} (${driver.name} ${driver.surname}) as PENDING`
			);
		} catch (error) {
			errorCount++;
			console.error(
				`${progress} ❌ Failed to mark driver ${driver.id}:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	// Print summary
	console.log('\n' + '='.repeat(60));
	console.log('📊 Summary:');
	console.log('='.repeat(60));
	console.log(`Total drivers processed: ${drivers.length}`);
	console.log(`✅ Successfully marked: ${successCount}`);
	console.log(`❌ Errors: ${errorCount}`);
	console.log('='.repeat(60));
	console.log('\n✨ Marking complete! Worker will process these drivers.');

	// Close database connection
	await client.end();
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
