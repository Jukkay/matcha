import { Request, Response } from 'express';
import { getSecret } from 'docker-secret';
import { IEmailToken } from '../interfaces/token';
import { execute } from '../utilities/SQLConnect';
import { verifyJWT } from '../utilities/promisifyJWT';
import bcryptjs from 'bcryptjs';

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, username, password } = req.body;
		if (!token) {
			return res.status(401).json({
				message: 'No token provided',
			});
		}
		if (!username) {
			return res.status(401).json({
				field: 'username',
				message: 'Missing username',
			});
		}
		if (!password) {
			return res.status(401).json({
				field: 'password',
				message: 'Missing password',
			});
		}
		const server_token = getSecret('server_token');
		const decoded = await verifyJWT(token, server_token);
		const { email } = decoded as IEmailToken;
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
		return res.status(401).json({
			message: 'Invalid user information',
		});
	} catch (err) {
		return res.status(401).json({
			message: 'Cannot verify password reset token',
		});
	}
};
