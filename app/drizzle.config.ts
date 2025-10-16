import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_HOST) throw new Error('DB_HOST is not set');
if (!process.env.DB_NAME) throw new Error('DB_NAME is not set');
if (!process.env.DB_USERNAME) throw new Error('DB_USERNAME is not set');
if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD is not set');

const connectionString = `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'mysql',
	dbCredentials: { url: connectionString },
	verbose: true,
	strict: true
});
