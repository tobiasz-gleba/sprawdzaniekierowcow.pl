#!/usr/bin/env bun
/**
 * Validation Worker
 *
 * Continuously processes pending driver validations from the database queue.
 * This worker runs as a separate container and processes one driver at a time.
 *
 * Usage:
 *   bun run scripts/validation-worker.ts
 *   or
 *   npm run worker:validate
 *
 * Environment Variables:
 *   WORKER_POLL_INTERVAL - Polling interval in milliseconds (default: 3000)
 *   WORKER_DELAY - Delay between validations in milliseconds (default: 2000)
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as table from '../src/lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { validateDriverStatusWithData } from '../src/lib/server/driverLicenceValidator.js';

// Create standalone database connection
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'sprawdzaniekierowcow';
const DB_USERNAME = process.env.DB_USERNAME || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

const connectionString = `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
const client = mysql.createPool(connectionString);
const db = drizzle(client, { schema: table, mode: 'default' });

// Worker configuration
const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL || '3000', 10);
const VALIDATION_DELAY = parseInt(process.env.WORKER_DELAY || '2000', 10);

// Worker state
let isProcessing = false;
let shouldShutdown = false;
const stats = {
	processed: 0,
	valid: 0,
	invalid: 0,
	errors: 0,
	startTime: new Date()
};

/**
 * Validate a single driver and update database
 */
async function validateDriver(driver: typeof table.driver.$inferSelect): Promise<void> {
	const startTime = Date.now();
	console.log(
		`[${new Date().toISOString()}] Processing driver ${driver.id}: ${driver.name} ${driver.surname}`
	);

	try {
		// Validate the driver license and get full data
		// Pass existing API URL to enable fast path validation
		const validationResult = await validateDriverStatusWithData(
			driver.name,
			driver.surname,
			driver.documentSerialNumber,
			driver.validationApiUrl
		);

		// Get existing verification history or create new array
		const existingHistory = (driver.verificationHistory as unknown[]) || [];

		// Add new verification result to history
		const updatedHistory = [
			...existingHistory,
			{
				timestamp: validationResult.timestamp,
				isValid: validationResult.isValid,
				data: validationResult.data,
				usedDirectApi: !!driver.validationApiUrl // Track if we tried direct API
			}
		];

		// Update the driver's status, verification history, API URL, AND reset processing flag
		const newStatus = validationResult.isValid ? 1 : 0;
		await db
			.update(table.driver)
			.set({
				status: newStatus,
				verificationHistory: updatedHistory,
				validationApiUrl: validationResult.apiUrl, // Store/update API URL
				processing: false // Reset processing flag
			})
			.where(eq(table.driver.id, driver.id));

		const duration = Date.now() - startTime;
		stats.processed++;

		if (validationResult.isValid) {
			stats.valid++;
			console.log(`[${new Date().toISOString()}] ✅ Driver ${driver.id} VALID (${duration}ms)`);
		} else {
			stats.invalid++;
			console.log(`[${new Date().toISOString()}] ❌ Driver ${driver.id} INVALID (${duration}ms)`);
		}
	} catch (error) {
		stats.errors++;
		const duration = Date.now() - startTime;
		console.error(
			`[${new Date().toISOString()}] ⚠️  Driver ${driver.id} ERROR (${duration}ms):`,
			error
		);

		// Mark as invalid and reset processing flag on error
		try {
			await db
				.update(table.driver)
				.set({ status: 0, processing: false })
				.where(eq(table.driver.id, driver.id));
		} catch (updateError) {
			console.error(
				`[${new Date().toISOString()}] Failed to update driver ${driver.id} status:`,
				updateError
			);
		}
	}
}

/**
 * Process one pending driver from the queue
 */
async function processNextDriver(): Promise<boolean> {
	if (isProcessing) {
		return false;
	}

	isProcessing = true;

	try {
		// First, try to fetch one pending driver that is NOT being processed (status = 2, processing = false)
		// Order by createdAt to process oldest first (FIFO)
		let pendingDrivers = await db
			.select()
			.from(table.driver)
			.where(and(eq(table.driver.status, 2), eq(table.driver.processing, false)))
			.orderBy(table.driver.createdAt)
			.limit(1);

		// If no unprocessed pending drivers, fallback to processed ones (allows parallel checking)
		if (pendingDrivers.length === 0) {
			console.log(
				`[${new Date().toISOString()}] No unprocessed pending drivers, checking already processing drivers...`
			);
			pendingDrivers = await db
				.select()
				.from(table.driver)
				.where(and(eq(table.driver.status, 2), eq(table.driver.processing, true)))
				.orderBy(table.driver.createdAt)
				.limit(1);
		}

		if (pendingDrivers.length === 0) {
			return false; // No pending drivers at all
		}

		const driver = pendingDrivers[0];

		// Set processing flag to true to lock this driver
		await db
			.update(table.driver)
			.set({ processing: true })
			.where(eq(table.driver.id, driver.id));

		console.log(`[${new Date().toISOString()}] 🔒 Locked driver ${driver.id} for processing`);

		// Validate the driver (this will reset processing flag when done)
		await validateDriver(driver);

		// Add delay between validations
		await new Promise((resolve) => setTimeout(resolve, VALIDATION_DELAY));

		return true; // Processed a driver
	} finally {
		isProcessing = false;
	}
}

/**
 * Main worker loop
 */
async function workerLoop(): Promise<void> {
	console.log('🔄 Worker loop starting...');

	while (!shouldShutdown) {
		try {
			const processed = await processNextDriver();

			if (!processed) {
				// No pending drivers, wait before checking again
				await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
			}
		} catch (error) {
			console.error(`[${new Date().toISOString()}] Worker loop error:`, error);
			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
		}
	}

	console.log('🔄 Worker loop stopped');
}

/**
 * Print worker statistics
 */
function printStats(): void {
	const uptime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000);
	const hours = Math.floor(uptime / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);
	const seconds = uptime % 60;

	console.log('\n' + '='.repeat(60));
	console.log('📊 Worker Statistics:');
	console.log('='.repeat(60));
	console.log(`Uptime: ${hours}h ${minutes}m ${seconds}s`);
	console.log(`Total processed: ${stats.processed}`);
	console.log(`✅ Valid: ${stats.valid}`);
	console.log(`❌ Invalid: ${stats.invalid}`);
	console.log(`⚠️  Errors: ${stats.errors}`);
	console.log('='.repeat(60) + '\n');
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
	console.log(`\n[${new Date().toISOString()}] Received ${signal}, shutting down gracefully...`);
	shouldShutdown = true;

	// Wait for current processing to complete (max 30 seconds)
	const maxWait = 30000;
	const startWait = Date.now();
	while (isProcessing && Date.now() - startWait < maxWait) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	if (isProcessing) {
		console.log('⚠️  Force stopping - validation in progress may be incomplete');
	}

	// Print final statistics
	printStats();

	// Clean up resources
	console.log('🧹 Cleaning up resources...');
	await client.end();
	console.log('✅ Cleanup complete');

	process.exit(0);
}

/**
 * Main function
 */
async function main() {
	console.log('🚗 Driver License Validation Worker');
	console.log('='.repeat(60));
	console.log(`Started at: ${new Date().toISOString()}`);
	console.log(`Database: ${DB_HOST}/${DB_NAME}`);
	console.log(`Poll interval: ${POLL_INTERVAL}ms`);
	console.log(`Validation delay: ${VALIDATION_DELAY}ms`);
	console.log('='.repeat(60) + '\n');

	// Set up graceful shutdown
	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));

	// Print stats every 5 minutes
	const statsInterval = setInterval(
		() => {
			if (!shouldShutdown) {
				printStats();
			}
		},
		5 * 60 * 1000
	);

	try {
		// Start worker loop
		await workerLoop();
	} catch (error) {
		console.error('❌ Fatal error in worker:', error);
		throw error;
	} finally {
		clearInterval(statsInterval);
	}
}

// Run the worker
main().catch((error) => {
	console.error('❌ Worker crashed:', error);
	process.exit(1);
});
