import nodemailer from 'nodemailer';
import { getAdminEmail, getEmailPassword, getEmailUser } from './checkENV';
import createReportMessage from './createReportMessage';

const mailUser: string = getEmailUser()
const password: string = getEmailPassword()

export const sendReportMessage = async (
	report_id: number,
	report_reason: number
) => {
	const adminEmail = getAdminEmail()
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
