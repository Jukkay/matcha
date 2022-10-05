import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import { sendEmailVerification } from '../utilities/sendEmailVerification';
import { sendPasswordResetEmail } from '../utilities/sendPasswordResetEmail';

export const sendNewEmailVerification = async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email)
		return res.status(400).json({
			field: 'email',
			message: 'Email is required',
		});
	const sql = `
		SELECT 
			validated 
		FROM 
			users 
		WHERE 
			email = ?;`;
	const emailVerified = await execute(sql, [email]);
	if (!emailVerified[0])
		return res.status(400).json({
			field: 'generic',
			message: 'No matching email was found',
		});
	if (emailVerified[0]['validated'])
		return res.status(400).json({
			field: 'generic',
			message: 'Your email has already been verified',
		});
	const emailSent = await sendEmailVerification(email);
	if (emailSent) {
		return res.status(200).json({
			message: 'Email verification sent successfully',
		});
	}
	return res.status(500).json({
		message: 'Email verification could not be sent',
	});
};

export const sendPasswordReset = async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email)
		return res.status(400).json({
			field: 'email',
			message: 'Email is required',
		});
	const sql = `
	  	SELECT 
			email 
		FROM 
			users 
		WHERE 
			email = ?;`;
	const emailExists = await execute(sql, [email]);
	if (!emailExists[0])
		return res.status(400).json({
			field: 'email',
			message: 'No matching email was found',
		});
	const emailSent = await sendPasswordResetEmail(email);
	if (emailSent) {
		return res.status(200).json({
			message: 'Reset email sent successfully',
		});
	}
	return res.status(500).json({
		field: 'generic',
		message: 'Email verification could not be sent',
	});
};
