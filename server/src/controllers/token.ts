import { Request, Response, NextFunction } from 'express';
import { getSecret } from 'docker-secret';
import { IAccesstoken, IEmailToken } from '../interfaces/token';
import { execute } from '../utilities/SQLConnect';
import { signAccessToken, verifyJWT } from '../utilities/promisifyJWT';
const tokenList = require('../index').tokenList;

export const verifyEmailToken = async (req: Request, res: Response) => {
	try {
		const { token } = req.body;
		const server_token = getSecret('server_token');
		if (!token) {
			return res.status(400).json({
				message: 'No token provided',
			});
		}
		const decoded = await verifyJWT(token, server_token);
		const { email } = decoded as IEmailToken;
		const sql = `UPDATE users SET validated = "1" WHERE email = ?;`;
		const result = await execute(sql, [email]);
		if (result)
			return res.status(200).json({
				message: 'Email verified',
			});
		return res.status(400).json({
			message: 'No user found with that email',
		});
	} catch (err) {
		return res.status(400).json({
			message: 'Cannot verify email token',
		});
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	try {
		const { user_id, token } = req.body;
		const refresh_token = getSecret('refresh_token');
		if (!token) {
			return res.json({
				status: 400,
				message: 'No token given',
			});
		}
		console.log('Token received')
		// Check if token is valid
		const decoded = await verifyJWT(token, refresh_token);
		if (!decoded) {
			return res.status(401).json({
				message: 'Invalid token',
			});
		}
		console.log('Token verified')
		//Check if refreshToken is on valid token list
		const findToken = `SELECT * FROM tokens WHERE token = ?;`;
		const foundToken = await execute(findToken, [token]);
		if (!foundToken) {
			return res.status(401).json({
				message: 'Token has been invalidated',
			});
		}
		// Create and return new access token
		const accessToken = await signAccessToken(user_id);
		if (!accessToken) {
			return res.status(500).json({
				message: 'Server error',
			});
		}
		return res.status(200).json({
			user_id: user_id,
			accessToken: accessToken,
		});
	} catch (err) {
		return res.status(403).json({
			message: 'Unauthorized',
		});
	}
};

export const updateRefreshTokenList = async (
	refreshToken: string,
	user_id: number
) => {
	try {
		//Check number of existing user tokens
		const findTokens = `SELECT user_id FROM tokens WHERE user_id = ?;`;
		const userTokens = await execute(findTokens, [user_id]);
		// Update first if more than 5
		if (userTokens.length > 4) {
			const updateToken = `UPDATE tokens SET token = ? WHERE user_id = ? ORDER BY token_id ASC LIMIT 1;`;
			await execute(updateToken, [refreshToken, user_id]);
			return;
		}
		const sql = `INSERT INTO tokens (token, user_id) VALUES (?, ?);`;
		await execute(sql, [refreshToken, user_id]);
	} catch (err) {
		console.error(err);
	}
};

export const deleteRefreshToken = async (refreshToken: string) => {
	try {
		const sql = `DELETE FROM tokens WHERE token = ?;`;
		await execute(sql, [refreshToken]);
	} catch (err) {
		console.error(err);
	}
};

export const decodeUserFromAccesstoken = async (req: Request) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1]
    const server_token = getSecret('server_token');
    if (!accessToken || !server_token) return
		const decoded = await verifyJWT(accessToken, server_token);
    if (!decoded) return 
    const { user_id } = decoded as IAccesstoken;
    return user_id
	} catch (err) {
		console.error(err);
	}
};
