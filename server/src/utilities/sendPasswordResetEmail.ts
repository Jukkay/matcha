import createResetMessage from './createResetMessage';
import { getSecret } from 'docker-secret';
import { signEmailToken } from '../utilities/promisifyJWT';
import nodemailer from 'nodemailer';
const mailUser: string = process.env.MAIL_USER || 'jukkacamagru@outlook.com';
const password: string = getSecret('outlook_password');

export const sendPasswordResetEmail = async (email: string) => {
	try {
		const email_token = await signEmailToken(email);
		const message = createResetMessage(email_token);
		const transporter = await nodemailer.createTransport({
			service: 'Outlook365',
			auth: {
				user: mailUser,
				pass: password,
			},
		});
		const messageOptions = {
			from: mailUser,
			to: email,
			subject: 'Reset your 42 Dates password',
			html: message,
		};
		await transporter.sendMail(messageOptions);
		console.log('Nodemailer sent message');
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};
