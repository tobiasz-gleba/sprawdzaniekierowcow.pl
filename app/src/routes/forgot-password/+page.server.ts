import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { sendPasswordResetEmail } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Redirect if already logged in
	if (event.locals.user) {
		return { redirect: '/' };
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

			// Always return success to prevent email enumeration
			if (!user) {
				return {
					success: true,
					message: 'Jeśli konto z tym adresem email istnieje, zostanie wysłany link do resetowania hasła.'
				};
			}

			// Create password reset token and send email
			const resetToken = await auth.createPasswordResetToken(user.id);
			
			try {
				await sendPasswordResetEmail(email, resetToken);
				return {
					success: true,
					message: 'Link do resetowania hasła został wysłany na Twój adres email.'
				};
			} catch (emailError) {
				console.error('Email sending error:', emailError);
				// For testing: show token if email fails
				const baseUrl = 'http://localhost:5173';
				return {
					success: true,
					message: `Email nie mógł być wysłany. Link resetowania: ${baseUrl}/reset-password?token=${resetToken}`
				};
			}
		} catch (error) {
			console.error('Password reset request error:', error);
			return fail(500, { message: 'Wystąpił błąd podczas przetwarzania żądania' });
		}
	}
};

