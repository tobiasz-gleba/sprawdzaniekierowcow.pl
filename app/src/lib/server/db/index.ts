import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DB_HOST) throw new Error('DB_HOST is not set');
if (!env.DB_NAME) throw new Error('DB_NAME is not set');
if (!env.DB_USERNAME) throw new Error('DB_USERNAME is not set');
if (!env.DB_PASSWORD) throw new Error('DB_PASSWORD is not set');

const connectionString = `mysql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}/${env.DB_NAME}`;

const client = mysql.createPool(connectionString);

export const db = drizzle(client, { schema, mode: 'default' });
