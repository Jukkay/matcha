import { getSecret } from 'docker-secret';
import nodemailer from 'nodemailer';
import createReportMessage from './createReportMessage';
const mailUser: string = process.env.MAIL_USER || 'jukkacamagru@outlook.com';
const password: string = getSecret('outlook_password');

export const sendReportMessage = async (
	report_id: number,
	report_reason: number
) => {
	const adminEmail = 'jukkacamagru@outlook.com';
	try {
		const message = createReportMessage(report_id, report_reason);
		const transporter = nodemailer.createTransport({
			service: 'Outlook365',
			auth: {
				user: mailUser,
				pass: password,
			},
		});
		const messageOptions = {
			from: mailUser,
			to: adminEmail,
			subject: 'User report for review',
			html: message,
		};
		await transporter.sendMail(messageOptions);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};
