import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { sendVerificationEmail } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Redirect if already logged in
	if (event.locals.user) {
		return redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		if (typeof email !== 'string' || !email) {
			return fail(400, { message: 'Nieprawidłowy adres email' });
		}

		try {
			// Find user by email
			const [user] = await db.select().from(table.user).where(eq(table.user.email, email));

			if (!user) {
				// Don't reveal if email exists or not for security
				return {
					success: true,
					message:
						'Jeśli konto z tym adresem email istnieje i nie jest zweryfikowane, zostanie wysłany email weryfikacyjny.'
				};
			}

			// Check if already verified
			if (user.emailVerified) {
				return {
					success: false,
					message: 'Ten adres email jest już zweryfikowany. Możesz się zalogować.'
				};
			}

			// Create new verification token and send email
			const verificationToken = await auth.createEmailVerificationToken(user.id);
			await sendVerificationEmail(email, verificationToken);

			return {
				success: true,
				message: 'Email weryfikacyjny został wysłany. Sprawdź swoją skrzynkę pocztową.'
			};
		} catch (error) {
			console.error('Error resending verification email:', error);
			return fail(500, { message: 'Wystąpił błąd podczas wysyłania emaila' });
		}
	}
};
