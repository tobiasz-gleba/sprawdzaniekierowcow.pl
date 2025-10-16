import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const EMAIL_USER = 'test-email@redstoneinstitute.pl';
const EMAIL_PASS = 'B6Em1wQ2mLPwxYAfD2Xm';
const SMTP_HOST = 'smtp.iq.pl';
const SMTP_PORT = 587;

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

function getBaseUrl(): string {
	// Priority: environment variable, then production URL, then default
	return process.env.PUBLIC_BASE_URL || process.env.ORIGIN || 'http://localhost:5173';
}

