import createMessage from './createMessage'
import { getSecret } from "docker-secret"

const nodemailer = require('nodemailer');
const mailUser: string = process.env.MAIL_USER || 'jukkacamagru@outlook.com'
const password: string = getSecret("outlook_password")

export const sendEmailVerification = async(email: string, email_token: string) => {
	try {
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

		// transporter.verify(function (error: any, success: any) {
			// 	if (error) {
				// 	  console.log(error);
				// 	} else {
					// 	  console.log("Server is ready to take our messages");
					// 	}
					//   });

		await transporter.sendMail(messageOptions)
		console.log('Nodemailer sent message')

	} catch (err) {
		console.error(err)
	}
}
