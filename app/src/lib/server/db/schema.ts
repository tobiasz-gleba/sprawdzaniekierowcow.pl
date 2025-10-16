import { mysqlTable, serial, int, varchar, datetime, boolean } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
	id: varchar('id', { length: 255 }).primaryKey(),
	age: int('age'),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	emailVerified: boolean('email_verified').notNull().default(false)
});

export const session = mysqlTable('session', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => user.id),
	expiresAt: datetime('expires_at').notNull()
});

export const driver = mysqlTable('driver', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	surname: varchar('surname', { length: 255 }).notNull(),
	documentSerialNumber: varchar('document_serial_number', { length: 255 }).notNull(),
	status: int('status').notNull().default(1),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => user.id),
	createdAt: datetime('created_at').notNull()
});

export const emailVerificationToken = mysqlTable('email_verification_token', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => user.id),
	expiresAt: datetime('expires_at').notNull()
});

export const passwordResetToken = mysqlTable('password_reset_token', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => user.id),
	expiresAt: datetime('expires_at').notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Driver = typeof driver.$inferSelect;

export type EmailVerificationToken = typeof emailVerificationToken.$inferSelect;

export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
