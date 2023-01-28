import { Request, Response } from 'express';
import { IEmailToken } from '../interfaces/token';
import { execute } from '../utilities/SQLConnect';
import { verifyJWT } from '../utilities/promisifyJWT';
import bcryptjs from 'bcryptjs';
import { getServerToken } from '../utilities/checkENV';

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, username, password } = req.body;
		if (!token) {
			return res.status(400).json({
				message: 'No token provided',
			});
		}
		if (!username) {
			return res.status(400).json({
				field: 'username',
				message: 'Missing username',
			});
		}
		if (!password) {
			return res.status(400).json({
				field: 'password',
				message: 'Missing password',
			});
		}
		const server_token = getServerToken()
		const decoded = await verifyJWT(token, server_token);
		if (!decoded)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		const { email } = decoded as IEmailToken;
		const check = `
			SELECT
				username,
				email
			FROM
				users
			WHERE
				email = ? 
				AND 
				username = ?;`;
		const matchedUsers = await execute(check, [email, username]);
		if (matchedUsers.length !== 1)
			return res.status(400).json({
				field: 'username',
				message: 'Username and email do not match'
			});
		const hash = await bcryptjs.hash(password, 10);
		const sql = `
			UPDATE 
				users 
			SET 
				password = ? 
			WHERE 
				email = ? 
				AND 
				username = ?;`;
		const response = await execute(sql, [hash, email, username]);
		if (response)
			return res.status(201).json({
				message: 'Password changed',
			});
		return res.status(400).json({
			message: 'Invalid user information',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Cannot verify password reset token',
		});
	}
};
