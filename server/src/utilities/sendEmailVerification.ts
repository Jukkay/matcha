import createMessage from './createMessage'
import { getSecret } from "docker-secret"

const nodemailer = require('nodemailer');
const port: string = process.env.PORT == '80' ? '' : ':' + process.env.PORT
const domain: string = process.env.DOMAIN_NAME || 'localhost'
const mailUser: string = process.env.MAIL_USER || 'jukkacamagru@outlook.com'
const password: string = getSecret("outlook_password")

const sendEmailVerification = (email: string, email_token: string) => {
	const message = createMessage(domain, port, email_token)
	const transporter = nodemailer.createTransport({
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

	transporter.sendMail(messageOptions, (error: any, info: any) => {
		if (error) {
			return console.log(error)
		}
		console.log('Nodemailer sent message: ' + info.response)
	})

}
export default sendEmailVerification