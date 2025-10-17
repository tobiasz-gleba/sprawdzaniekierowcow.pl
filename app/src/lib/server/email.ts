import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';

// Load SMTP configuration from environment variables
function getEmailConfig() {
	const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT } = env;
	
	if (!EMAIL_USER || !EMAIL_PASS || !SMTP_HOST) {
		throw new Error(
			'Missing required SMTP environment variables: EMAIL_USER, EMAIL_PASS, SMTP_HOST'
		);
	}

	return {
		EMAIL_USER,
		EMAIL_PASS,
		SMTP_HOST,
		SMTP_PORT: parseInt(SMTP_PORT || '587', 10)
	};
}

let transporter: Transporter | null = null;

function getTransporter() {
	if (!transporter) {
		const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT } = getEmailConfig();
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
	const { EMAIL_USER } = getEmailConfig();
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
	const { EMAIL_USER } = getEmailConfig();
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
	// Use environment variable for base URL
	return env.PUBLIC_BASE_URL || 'http://localhost:5173';
}
