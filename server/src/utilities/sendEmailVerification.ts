import createMessage from './createMessage'
import { getSecret } from "docker-secret"
import { signEmailToken } from "../utilities/promisifyJWT";
import nodemailer from 'nodemailer';
const mailUser: string = process.env.MAIL_USER || 'jukkacamagru@outlook.com'
const password: string = getSecret("outlook_password")

export const sendEmailVerification = async(email: string) => {
	try {
		const email_token = await signEmailToken(email);
		const message = createMessage(email_token)
		const transporter = await nodemailer.createTransport({
			service: "Outlook365",
			auth: {
				user: mailUser,
				pass: password
			}
		})
		const messageOptions = {
			from: mailUser,
			to: email,
			subject: 'Welcome to 42 Dates. Confirm your email address',
			html: message
		};
		await transporter.sendMail(messageOptions)
		console.log('Nodemailer sent message')
		return true
	} catch (err) {
		console.error(err)
		return false
	}
}
