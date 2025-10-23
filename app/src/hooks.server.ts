import type { Handle, HandleServerError } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	try {
		const { session, user } = await auth.validateSessionToken(sessionToken);

		if (session) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			auth.deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;
	} catch (error) {
		// If session validation fails (e.g., database error), treat as logged out
		console.error('Session validation error:', error);
		event.locals.user = null;
		event.locals.session = null;
		auth.deleteSessionTokenCookie(event);
	}

	return resolve(event);
};

export const handle: Handle = handleAuth;

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	// Log minimal error info in production, detailed in development
	if (process.env.NODE_ENV === 'production') {
		console.error(`[ERROR ${errorId}] ${status} - ${event.url.pathname}`);
	} else {
		// Log the error with full details in development
		console.error('='.repeat(80));
		console.error(`[ERROR ${errorId}] ${new Date().toISOString()}`);
		console.error(`Status: ${status}`);
		console.error(`Message: ${message}`);
		console.error(`Path: ${event.url.pathname}`);
		console.error(`Method: ${event.request.method}`);
		console.error(`User: ${event.locals.user?.id || 'Not authenticated'}`);
		console.error('Headers:', Object.fromEntries(event.request.headers.entries()));

		if (error instanceof Error) {
			console.error('Error name:', error.name);
			console.error('Error message:', error.message);
			console.error('Stack trace:', error.stack);
		} else {
			console.error('Error object:', error);
		}

		console.error('='.repeat(80));
	}

	return {
		message:
			process.env.NODE_ENV === 'production'
				? 'An error occurred. Please try again later.'
				: message,
		errorId
	};
};
