#!/usr/bin/env bun
/**
 * CLI tool to send email notifications to users with invalid drivers
 *
 * Usage:
 *   bun run scripts/notify-invalid-drivers.ts
 *   or
 *   tsx scripts/notify-invalid-drivers.ts
 *
 * Options:
 *   --user-id <id>   Only send notification to a specific user
 *   --dry-run        Show what emails would be sent without actually sending them
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as table from '../src/lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import nodemailer from 'nodemailer';

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
	dryRun: boolean;
}

interface UserWithInvalidDrivers {
	user: typeof table.user.$inferSelect;
	invalidDrivers: (typeof table.driver.$inferSelect)[];
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
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--help' || arg === '-h') {
			console.log(`
Usage: bun run scripts/notify-invalid-drivers.ts [options]

Options:
  --user-id <id>   Only send notification to a specific user
  --dry-run        Show what emails would be sent without actually sending them
  --help, -h       Show this help message
			`);
			process.exit(0);
		}
	}

	return options;
}

// Get email configuration
function getEmailConfig() {
	const EMAIL_USER = process.env.EMAIL_USER;
	const EMAIL_PASS = process.env.EMAIL_PASS;
	const SMTP_HOST = process.env.SMTP_HOST;
	const SMTP_PORT = process.env.SMTP_PORT;

	if (!EMAIL_USER || !EMAIL_PASS || !SMTP_HOST) {
		throw new Error(
			'Missing required SMTP environment variables: EMAIL_USER, EMAIL_PASS, SMTP_HOST'
		);
	}

	return {
		EMAIL_USER,
		EMAIL_PASS,
		SMTP_HOST,
		SMTP_PORT: parseInt(SMTP_PORT || '587', 10)
	};
}

// Create email transporter
function createTransporter() {
	const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT } = getEmailConfig();
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		secure: false, // true for 465, false for other ports
		auth: {
			user: EMAIL_USER,
			pass: EMAIL_PASS
		}
	});
}

// Get base URL
function getBaseUrl(): string {
	return process.env.PUBLIC_BASE_URL || 'https://sprawdzaniekierowcow.pl';
}

// Send email notification about invalid drivers
async function sendInvalidDriversNotification(
	email: string,
	invalidDrivers: (typeof table.driver.$inferSelect)[],
	dryRun: boolean = false
) {
	const { EMAIL_USER } = getEmailConfig();
	const dashboardUrl = `${getBaseUrl()}/dashboard`;

	// Build driver list
	const driverList = invalidDrivers
		.map((driver) => `• ${driver.name} ${driver.surname} (${driver.documentSerialNumber})`)
		.join('\n');

	const driverListHtml = invalidDrivers
		.map((driver) => `<li>${driver.name} ${driver.surname} (${driver.documentSerialNumber})</li>`)
		.join('');

	const mailOptions = {
		from: `"Sprawdzanie Kierowców" <${EMAIL_USER}>`,
		to: email,
		subject: 'Uwaga: Nieprawidłowe prawa jazdy w systemie',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body {
						font-family: Arial, sans-serif;
						line-height: 1.6;
						color: #333;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}
					.alert {
						background-color: #fee;
						border-left: 4px solid #d00;
						padding: 15px;
						margin: 20px 0;
					}
					.button {
						display: inline-block;
						background-color: #007bff;
						color: white;
						padding: 12px 24px;
						text-decoration: none;
						border-radius: 4px;
						margin: 20px 0;
					}
					.driver-list {
						background-color: #f8f9fa;
						padding: 15px;
						border-radius: 4px;
						margin: 20px 0;
					}
					.driver-list ul {
						margin: 0;
						padding-left: 20px;
					}
					.driver-list li {
						margin: 5px 0;
					}
					.footer {
						margin-top: 30px;
						padding-top: 20px;
						border-top: 1px solid #ddd;
						color: #666;
						font-size: 14px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h2>Uwaga: Nieprawidłowe prawa jazdy</h2>
					
					<div class="alert">
						<strong>⚠️ Wykryto nieprawidłowe prawa jazdy</strong>
					</div>
					
					<p>Informujemy, że w systemie wykryto następujące prawa jazdy ze statusem <strong>NIEPRAWIDŁOWY</strong>:</p>
					
					<div class="driver-list">
						<ul>
							${driverListHtml}
						</ul>
					</div>
					
					<p>Status "nieprawidłowy" może oznaczać, że:</p>
					<ul>
						<li>Prawo jazdy zostało zawieszone</li>
						<li>Prawo jazdy zostało cofnięte</li>
						<li>Dane są niepoprawne lub niepełne</li>
					</ul>
					
					<p>Zalecamy niezwłoczne sprawdzenie statusu tych praw jazdy.</p>
					
					<a href="${dashboardUrl}" class="button">Przejdź do panelu</a>
					
					<div class="footer">
						<p>To jest automatyczna wiadomość z systemu Sprawdzanie Kierowców.</p>
						<p>Jeśli masz pytania, skontaktuj się z nami poprzez stronę kontaktową.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
Uwaga: Nieprawidłowe prawa jazdy

⚠️ Wykryto nieprawidłowe prawa jazdy

Informujemy, że w systemie wykryto następujące prawa jazdy ze statusem NIEPRAWIDŁOWY:

${driverList}

Status "nieprawidłowy" może oznaczać, że:
- Prawo jazdy zostało zawieszone
- Prawo jazdy zostało cofnięte
- Dane są niepoprawne lub niepełne

Zalecamy niezwłoczne sprawdzenie statusu tych praw jazdy.

Przejdź do panelu: ${dashboardUrl}

---
To jest automatyczna wiadomość z systemu Sprawdzanie Kierowców.
Jeśli masz pytania, skontaktuj się z nami poprzez stronę kontaktową.
		`
	};

	if (dryRun) {
		console.log('  📧 [DRY RUN] Would send email:');
		console.log(`     To: ${email}`);
		console.log(`     Subject: ${mailOptions.subject}`);
		console.log(`     Invalid drivers count: ${invalidDrivers.length}`);
		return { success: true, dryRun: true };
	}

	try {
		const transporter = createTransporter();
		const info = await transporter.sendMail(mailOptions);
		console.log(`  ✅ Email sent successfully (Message ID: ${info.messageId})`);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error(`  ❌ Failed to send email:`, error);
		throw error;
	}
}

// Fetch users with invalid drivers
async function fetchUsersWithInvalidDrivers(
	options: CliOptions
): Promise<UserWithInvalidDrivers[]> {
	console.log('📊 Fetching users with invalid drivers from database...');

	// Fetch all invalid drivers (status = 0)
	let query = db.select().from(table.driver).where(eq(table.driver.status, 0));

	if (options.userId) {
		query = query.where(
			and(eq(table.driver.status, 0), eq(table.driver.userId, options.userId))
		) as typeof query;
	}

	const invalidDrivers = await query;

	if (invalidDrivers.length === 0) {
		return [];
	}

	// Group drivers by user ID
	const driversByUser = new Map<string, (typeof table.driver.$inferSelect)[]>();
	for (const driver of invalidDrivers) {
		const userDrivers = driversByUser.get(driver.userId) || [];
		userDrivers.push(driver);
		driversByUser.set(driver.userId, userDrivers);
	}

	// Fetch user information for each user with invalid drivers
	const usersWithInvalidDrivers: UserWithInvalidDrivers[] = [];

	for (const [userId, drivers] of driversByUser.entries()) {
		const users = await db.select().from(table.user).where(eq(table.user.id, userId));

		if (users.length > 0) {
			usersWithInvalidDrivers.push({
				user: users[0],
				invalidDrivers: drivers
			});
		}
	}

	return usersWithInvalidDrivers;
}

// Main function
async function main() {
	console.log('📧 Invalid Drivers Email Notification CLI\n');

	const options = parseArgs();

	console.log('Options:');
	console.log(`  User ID filter: ${options.userId || 'All users'}`);
	console.log(`  Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
	console.log('');

	// Fetch users with invalid drivers
	const usersWithInvalidDrivers = await fetchUsersWithInvalidDrivers(options);

	console.log(`Found ${usersWithInvalidDrivers.length} user(s) with invalid drivers\n`);

	if (usersWithInvalidDrivers.length === 0) {
		console.log('✨ No users with invalid drivers found. Nothing to do!');
		await client.end();
		process.exit(0);
	}

	// Show summary
	console.log('📋 Users with invalid drivers:');
	usersWithInvalidDrivers.forEach((item, index) => {
		console.log(`  ${index + 1}. User: ${item.user.email} (ID: ${item.user.id})`);
		console.log(`     Invalid drivers: ${item.invalidDrivers.length}`);
		item.invalidDrivers.forEach((driver) => {
			console.log(`       - ${driver.name} ${driver.surname} (${driver.documentSerialNumber})`);
		});
	});
	console.log('');

	if (options.dryRun) {
		console.log('✅ Dry run complete. Use without --dry-run to actually send emails.');
		await client.end();
		process.exit(0);
	}

	// Send notifications
	console.log('📧 Sending email notifications...\n');

	let successCount = 0;
	let errorCount = 0;

	for (let i = 0; i < usersWithInvalidDrivers.length; i++) {
		const item = usersWithInvalidDrivers[i];
		const progress = `[${i + 1}/${usersWithInvalidDrivers.length}]`;

		console.log(`${progress} Sending notification to: ${item.user.email}`);
		console.log(`  ├─ User ID: ${item.user.id}`);
		console.log(`  ├─ Invalid drivers count: ${item.invalidDrivers.length}`);

		try {
			await sendInvalidDriversNotification(item.user.email, item.invalidDrivers, options.dryRun);
			successCount++;
		} catch (error) {
			errorCount++;
			console.error(`${progress} ⚠️  ERROR sending to ${item.user.email}`);
			console.error(`  └─ Error: ${error instanceof Error ? error.message : String(error)}\n`);
		}

		console.log('');
	}

	// Print summary
	console.log('\n' + '='.repeat(60));
	console.log('📊 Email Notification Summary:');
	console.log('='.repeat(60));
	console.log(`Total users processed: ${usersWithInvalidDrivers.length}`);
	console.log(`✅ Successfully sent: ${successCount}`);
	console.log(`⚠️  Errors: ${errorCount}`);
	console.log('='.repeat(60));
	console.log('\n✨ Notification process complete!');

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
