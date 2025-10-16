import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return {
			error: true,
			message: 'Brak tokenu resetowania hasła'
		};
	}

	try {
		// Verify token exists and is not expired
		const [resetToken] = await db
			.select()
			.from(table.passwordResetToken)
			.where(eq(table.passwordResetToken.id, token));

		if (!resetToken) {
			return {
				error: true,
				message: 'Nieprawidłowy token resetowania hasła'
			};
		}

		if (Date.now() >= resetToken.expiresAt.getTime()) {
			// Delete expired token
			await db
				.delete(table.passwordResetToken)
				.where(eq(table.passwordResetToken.id, token));

			return {
				error: true,
				message: 'Token resetowania hasła wygasł. Poproś o nowy link.'
			};
		}

		return {
			error: false,
			token
		};
	} catch (error) {
		console.error('Error validating reset token:', error);
		return {
			error: true,
			message: 'Wystąpił błąd podczas walidacji tokenu'
		};
	}
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (typeof token !== 'string' || !token) {
			return fail(400, { message: 'Nieprawidłowy token' });
		}

		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, { message: 'Hasło musi mieć od 6 do 255 znaków' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Hasła nie są identyczne' });
		}

		try {
			// Find and validate token
			const [resetToken] = await db
				.select()
				.from(table.passwordResetToken)
				.where(eq(table.passwordResetToken.id, token));

			if (!resetToken) {
				return fail(400, { message: 'Nieprawidłowy token resetowania hasła' });
			}

			if (Date.now() >= resetToken.expiresAt.getTime()) {
				await db
					.delete(table.passwordResetToken)
					.where(eq(table.passwordResetToken.id, token));
				return fail(400, { message: 'Token resetowania hasła wygasł' });
			}

			// Hash new password
			const passwordHash = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			// Update user password
			await db
				.update(table.user)
				.set({ passwordHash })
				.where(eq(table.user.id, resetToken.userId));

			// Delete the used token
			await db
				.delete(table.passwordResetToken)
				.where(eq(table.passwordResetToken.id, token));
		} catch (error) {
			console.error('Password reset error:', error);
			return fail(500, { message: 'Wystąpił błąd podczas resetowania hasła' });
		}

		// Redirect to login with success message (outside try/catch)
		redirect(302, '/login?reset=success');
	}
};

