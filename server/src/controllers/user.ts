import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import bcryptjs from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utilities/promisifyJWT';
import { sendEmailVerification } from '../utilities/sendEmailVerification';
import { convertBirthdayToAge } from '../utilities/helpers';
import { validateRegistrationInput } from '../utilities/validators';
import { decodeUserFromAccesstoken, deleteRefreshToken, updateRefreshTokenList } from './token';

const register = async (req: Request, res: Response) => {
  const validationResponse = await validateRegistrationInput(req, res);
  if (validationResponse !== undefined) return;
  const { username, password, name, email, birthday } = req.body;
  const hash = await bcryptjs.hash(password, 10);
  const sql = `INSERT INTO users (username, password, email, name, birthday) VALUES (?, ?, ?, ?, ?);`;
  try {
  const result = await execute(sql, [
			username,
			hash,
			email,
			name,
			birthday,
		]);
		await sendEmailVerification(req.body.email);
		return res.status(201).json({
			message: 'User added successfully',
		});
	} catch (error) {
		let errorMessage;
		if (error instanceof Error) errorMessage = error.message;
		else errorMessage = 'Registration failed. Unknown error.';
		return res.status(500).json({
			message: errorMessage,
		});
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		if (!username)
			return res.status(400).json({
				auth: false,
				field: 'username',
				message: 'Missing username',
			});
		if (!password)
			return res.status(400).json({
				auth: false,
				field: 'password',
				message: 'Missing password',
			});
		const sql = `SELECT user_id, username, password, email, name, validated, birthday, profile_exists FROM users WHERE username = ?;`;
		const user = await execute(sql, username);
		if (!user[0]) {
			return res.status(401).json({
				auth: false,
				field: 'username',
				message: 'Invalid user',
			});
		}
		const match = await bcryptjs.compare(password, user[0].password);
		if (!match) {
			return res.status(401).json({
				auth: false,
				field: 'password',
				message: 'Invalid password',
			});
		}
		if (user[0].validated != true) {
			return res.status(401).json({
				auth: false,
				field: 'generic',
				message:
					'Email not validated. Check your inbox for the confirmation email or click link below to re-send it.',
			});
		}

		const accessToken = await signAccessToken(user[0].user_id);
		const refreshToken = await signRefreshToken(user[0].user_id);
		if (accessToken && refreshToken) {
			await updateRefreshTokenList(refreshToken, user[0].user_id);
			return res.status(200).json({
				auth: true,
				user: {
					username: user[0].username,
					user_id: user[0].user_id,
					email: user[0].email,
					name: user[0].name,
					age: convertBirthdayToAge(user[0].birthday),
					profile_exists: user[0].profile_exists
				},
				accessToken: accessToken,
				refreshToken: refreshToken,
			});
		}
	} catch (error) {
		let errorMessage;
		if (error instanceof Error) errorMessage = error.message;
		else errorMessage = 'Login failed. Unknown error.';
		return res.status(500).json({
			message: errorMessage,
		});
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken)
			return res.status(400).json({ message: 'Missing token' });
		await deleteRefreshToken(refreshToken);
		return res.status(200).json({
			message: 'Logout successful',
		});
	} catch (error) {
		let errorMessage;
		if (error instanceof Error) errorMessage = error.message;
		else errorMessage = 'Login failed. Unknown error.';
		return res.status(500).json({
			message: errorMessage,
		});
	}
};

const getUserInformation = async (req: Request, res: Response) => {
	// Get user_id
	const user_id = await decodeUserFromAccesstoken(req);
	if (!user_id)
		return res.status(500).json({
			message: 'Cannot parse user_id',
		});
	console.log('in getUserInformation', req.get('authorization'));
	return res.status(200).json({
		message: 'Message',
		data: 'empty',
	});
};

const deleteUser = async (req: Request, res: Response) => {
	// Get user_id
	const user_id = await decodeUserFromAccesstoken(req);
	if (!user_id)
		return res.status(500).json({
			message: 'Cannot parse user_id',
		});
	console.log('in deleteUser', req.get('authorization'));
	return res.status(200).json({
		message: 'Message',
		data: 'empty',
	});
};

const updateUser = async (req: Request, res: Response) => {
	// Get user_id
	const user_id = await decodeUserFromAccesstoken(req);
	if (!user_id)
		return res.status(500).json({
			message: 'Cannot parse user_id',
		});
	console.log('in updateUser', req.get('authorization'));
	return res.status(200).json({
		message: 'Message',
		data: 'empty',
	});
};

const blockUser = async (req: Request, res: Response) => {
	// Get user_id
	const user_id = await decodeUserFromAccesstoken(req);
	if (!user_id)
		return res.status(500).json({
			message: 'Cannot parse user_id',
		});
	console.log('Block user. Function incomplete.');
	return res.status(200).json({
		message: 'Message',
	});
};
export default { register, login, getUserInformation, deleteUser, updateUser, blockUser };
