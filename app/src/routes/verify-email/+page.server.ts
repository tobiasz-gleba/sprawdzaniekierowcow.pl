import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return {
			success: false,
			message: 'Brak tokenu weryfikacyjnego'
		};
	}

	try {
		// Find the verification token
		const [verificationToken] = await db
			.select()
			.from(table.emailVerificationToken)
			.where(eq(table.emailVerificationToken.id, token));

		if (!verificationToken) {
			return {
				success: false,
				message: 'Nieprawidłowy token weryfikacyjny'
			};
		}

		// Check if token has expired
		if (Date.now() >= verificationToken.expiresAt.getTime()) {
			// Delete expired token
			await db
				.delete(table.emailVerificationToken)
				.where(eq(table.emailVerificationToken.id, token));

			return {
				success: false,
				message: 'Token weryfikacyjny wygasł. Zarejestruj się ponownie.'
			};
		}

		// Update user's email verification status
		await db
			.update(table.user)
			.set({ emailVerified: true })
			.where(eq(table.user.id, verificationToken.userId));

		// Delete the used token
		await db.delete(table.emailVerificationToken).where(eq(table.emailVerificationToken.id, token));

		return {
			success: true,
			message: 'Email został pomyślnie zweryfikowany! Możesz się teraz zalogować.'
		};
	} catch (error) {
		console.error('Error verifying email:', error);
		return {
			success: false,
			message: 'Wystąpił błąd podczas weryfikacji emaila'
		};
	}
};
