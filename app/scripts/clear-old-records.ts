#!/usr/bin/env bun
/**
 * Cleanup Verification History
 *
 * Removes verification_history entries older than X days
 * using the `timestamp` field.
 *
 * Default: keep last 365 days
 *
 * Usage:
 *   npm run cleanup:old-records
 *   npm run cleanup:old-records -- --days 180
 *   npm run cleanup:old-records -- --driver-id <id> --dry-run
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as table from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'sprawdzaniekierowcow';
const DB_USERNAME = process.env.DB_USERNAME || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

const connectionString = `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
const client = mysql.createPool(connectionString);
const db = drizzle(client, { schema: table, mode: 'default' });

interface CliOptions {
	days: number;
	driverId?: string;
	dryRun: boolean;
}

function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		days: 365,
		dryRun: false
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--days' && i + 1 < args.length) {
			options.days = parseInt(args[++i], 10);
		} else if (arg === '--driver-id' && i + 1 < args.length) {
			options.driverId = args[++i];
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			console.log(`
Usage: npm run cleanup:old-records -- [options]

Options:
  --days <number>    Keep records newer than X days (default: 365)
  --driver-id <id>   Process only one driver
  --dry-run          Preview changes without updating database
  --help, -h         Show this help
`);
			process.exit(0);
		}
	}

	return options;
}


function cleanupVerificationHistory(
	history: any[],
	cutoffDate: Date
): any[] {
	return history.filter((entry) => {
		if (!entry?.timestamp) {
			//Keep entries without timestamp
			return true;
		}

		const entryDate = new Date(entry.timestamp);

		if (isNaN(entryDate.getTime())) {
			return true;
		}

		return entryDate >= cutoffDate;
	});
}

async function main() {
	console.log('Cleanup old verification history records\n');

	const options = parseArgs();
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - options.days);

	console.log('Options:');
	console.log(`  Cutoff date: ${cutoffDate.toISOString()}`);
	console.log(`  Driver filter: ${options.driverId || 'ALL'}`);
	console.log(`  Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
	console.log('');

	let query = db
		.select({
			id: table.driver.id,
			verificationHistory: table.driver.verificationHistory
		})
		.from(table.driver);

	if (options.driverId) {
		query = query.where(eq(table.driver.id, options.driverId)) as typeof query;
	}

	console.log('Fetching drivers...');
	const drivers = await query;

	if (drivers.length === 0) {
    console.log('No drivers found. Quitting.');
		await client.end();
		return;
	}

	let updated = 0;
	let skipped = 0;

	for (const driver of drivers) {
		if (!driver.verificationHistory) {
			skipped++;
			continue;
		}

		let parsed: any[];

		try {
			parsed =
				typeof driver.verificationHistory === 'string'
					? JSON.parse(driver.verificationHistory)
					: driver.verificationHistory;
		} catch (err) {
			console.error(`Invalid JSON for driver ${driver.id}: ${err}`);
			continue;
		}

		if (!Array.isArray(parsed)) {
			console.warn(`verification_history is not an array for driver ${driver.id}`);
			continue;
		}

		const cleaned = cleanupVerificationHistory(parsed, cutoffDate);

		if (cleaned.length === parsed.length) {
			skipped++;
			continue;
		}

		if (!options.dryRun) {
			await db
				.update(table.driver)
				.set({
					verificationHistory: JSON.stringify(cleaned)
				})
				.where(eq(table.driver.id, driver.id));
		}

		updated++;
	}

	console.log('Summary');
	console.log(`Drivers processed: ${drivers.length}`);
	console.log(`Updated: ${updated}`);
	console.log(`Skipped: ${skipped}`);
	console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
	console.log('='.repeat(50));

	await client.end();
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Fatal error:', err);
		process.exit(1);
	});
