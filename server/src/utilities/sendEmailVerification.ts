import createMessage from './createMessage';
import { signEmailToken } from '../utilities/promisifyJWT';
import nodemailer from 'nodemailer';
import { getEmailPassword, getEmailUser } from './checkENV';

const mailUser: string = getEmailUser()
const password: string = getEmailPassword()

export const sendEmailVerification = async (email: string) => {
	try {
		const email_token = await signEmailToken(email);
		const message = createMessage(email_token);
		const transporter = nodemailer.createTransport({
			service: 'Outlook365',
			auth: {
				user: mailUser,
				pass: password,
			},
		});
		const messageOptions = {
			from: mailUser,
			to: email,
			subject: 'Welcome to 42 Dates. Confirm your email address',
			html: message,
		};
		await transporter.sendMail(messageOptions);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};
