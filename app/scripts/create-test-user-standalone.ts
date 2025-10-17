#!/usr/bin/env bun
/**
 * Create a test user for testing purposes - standalone version
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { hash } from '@node-rs/argon2';
import { encodeBase64url } from '@oslojs/encoding';
import { mysqlTable, varchar, int, boolean, datetime } from 'drizzle-orm/mysql-core';
import { eq } from 'drizzle-orm';

// Define user table schema
const user = mysqlTable('user', {
	id: varchar('id', { length: 255 }).primaryKey(),
	age: int('age'),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	emailVerified: boolean('email_verified').notNull().default(false)
});

function generateUserId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase64url(bytes);
}

async function createTestUser() {
	const email = 'test@test.local';
	const password = 'test123';

	console.log('🔧 Creating test user...');
	console.log(`   Email: ${email}`);
	console.log(`   Password: ${password}`);

	// Get environment variables
	const DB_HOST = process.env.DB_HOST || 'localhost';
	const DB_NAME = process.env.DB_NAME || 'sprawdzaniekierowcow';
	const DB_USERNAME = process.env.DB_USERNAME || 'root';
	const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

	const connectionString = `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;

	try {
		// Connect to database
		const client = mysql.createPool(connectionString);
		const db = drizzle(client, { mode: 'default' });

		// Check if user already exists
		const existingUsers = await db.select().from(user).where(eq(user.email, email));

		if (existingUsers.length > 0) {
			console.log('\n✅ Test user already exists!');
			console.log(`   User ID: ${existingUsers[0].id}`);
			console.log(`   Email verified: ${existingUsers[0].emailVerified}`);
			
			// Update to ensure email is verified
			if (!existingUsers[0].emailVerified) {
				await db.update(user)
					.set({ emailVerified: true })
					.where(eq(user.id, existingUsers[0].id));
				console.log('\n📧 Updated email verified status to true');
			}
			
			await client.end();
			return;
		}

		// Hash the password
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Generate user ID
		const userId = generateUserId();

		// Insert user
		await db.insert(user).values({
			id: userId,
			email,
			passwordHash,
			emailVerified: true // Skip email verification for testing
		});

		console.log('\n✅ Test user created successfully!');
		console.log(`   User ID: ${userId}`);
		console.log('\n📝 Login credentials:');
		console.log(`   Email: ${email}`);
		console.log(`   Password: ${password}`);

		await client.end();
	} catch (error) {
		console.error('\n❌ Error creating test user:', error);
		process.exit(1);
	}
}

createTestUser()
	.then(() => {
		console.log('\n✨ Done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});

