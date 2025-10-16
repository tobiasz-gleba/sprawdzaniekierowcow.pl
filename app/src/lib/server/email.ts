import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Load SMTP configuration from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);

if (!EMAIL_USER || !EMAIL_PASS || !SMTP_HOST) {
	throw new Error('Missing required SMTP environment variables: EMAIL_USER, EMAIL_PASS, SMTP_HOST');
}

let transporter: Transporter;

function getTransporter() {
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: false, // true for 465, false for other ports
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASS
			}
		});
	}
	return transporter;
}

export async function sendVerificationEmail(email: string, token: string) {
	const verificationUrl = `${getBaseUrl()}/verify-email?token=${token}`;
	
	const mailOptions = {
		from: `"Sprawdzanie Kierowców" <${EMAIL_USER}>`,
		to: email,
		subject: 'Potwierdź swój adres email',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
			</head>
			<body>
				<div class="container">
					<h2>Hej!</h2>
					<p>Aby potwierdzić swój adres email, kliknij poniższy przycisk:</p>
					<a href="${verificationUrl}" class="button">Potwierdź email</a>
					<p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
					<p><a href="${verificationUrl}">${verificationUrl}</a></p>
					<p>Link jest ważny przez 24 godziny.</p>
					<div class="footer">
						<p>Jeśli nie zakładałeś konta w naszym serwisie, zignoruj tę wiadomość.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
Hej!

Aby potwierdzić swój adres email, kliknij poniższy link:
${verificationUrl}

Link jest ważny przez 24 godziny.

Jeśli nie zakładałeś konta w naszym serwisie, zignoruj tę wiadomość.
		`
	};

	try {
		const info = await getTransporter().sendMail(mailOptions);
		console.log('Verification email sent:', info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('Error sending verification email:', error);
		throw error;
	}
}

export async function sendPasswordResetEmail(email: string, token: string) {
	const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
	
	const mailOptions = {
		from: `"Sprawdzanie Kierowców" <${EMAIL_USER}>`,
		to: email,
		subject: 'Resetowanie hasła',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
					.footer { margin-top: 30px; font-size: 12px; color: #666; }
				</style>
			</head>
			<body>
				<div class="container">
					<h2>Resetowanie hasła</h2>
					<p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
					<p>Aby ustawić nowe hasło, kliknij poniższy przycisk:</p>
					<a href="${resetUrl}" class="button">Zresetuj hasło</a>
					<p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
					<p><a href="${resetUrl}">${resetUrl}</a></p>
					<p>Link jest ważny przez 24 godziny.</p>
					<div class="footer">
						<p>Jeśli nie prosiłeś o zresetowanie hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
Resetowanie hasła

Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.

Aby ustawić nowe hasło, kliknij poniższy link:
${resetUrl}

Link jest ważny przez 24 godziny.

Jeśli nie prosiłeś o zresetowanie hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.
		`
	};

	try {
		const info = await getTransporter().sendMail(mailOptions);
		console.log('Password reset email sent:', info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error('Error sending password reset email:', error);
		throw error;
	}
}

function getBaseUrl(): string {
	// Priority: environment variable, then production URL, then default
	return process.env.PUBLIC_BASE_URL || process.env.ORIGIN || 'http://localhost:5173';
}

