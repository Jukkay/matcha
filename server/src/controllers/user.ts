import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import bcryptjs from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utilities/promisifyJWT';
import { sendEmailVerification } from '../utilities/sendEmailVerification';
import {
	reformatDate,
} from '../utilities/helpers';
import { validateRegistrationInput } from '../utilities/validators';
import {
	decodeUserFromAccesstoken,
	deleteRefreshToken,
	updateRefreshTokenList,
} from './token';
import { findMatch, removeMatch } from './match';
import { sendReportMessage } from '../utilities/sendReportMessage';
import { unlink } from 'fs';

const register = async (req: Request, res: Response) => {
	const validationResponse = await validateRegistrationInput(req, res);
	if (validationResponse !== undefined) return;
	const { username, password, name, email, birthday } = req.body;
	const hash = await bcryptjs.hash(password, 10);
	const sql = `INSERT INTO users (username, password, email, name, birthday) VALUES (?, ?, ?, ?, ?);`;
	try {
		await execute(sql, [
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

		// Get user data
		const sql = `SELECT user_id, username, password, email, name, validated, birthday, profile_exists, location_permitted FROM users WHERE username = ?;`;
		const user = await execute(sql, username);
		if (!user[0]) {
			return res.status(401).json({
				auth: false,
				field: 'username',
				message: 'Invalid user',
			});
		}
		// Check password
		const match = await bcryptjs.compare(password, user[0].password);
		if (!match) {
			return res.status(401).json({
				auth: false,
				field: 'password',
				message: 'Invalid password',
			});
		}
		// Check email validation
		if (user[0].validated != true) {
			return res.status(401).json({
				auth: false,
				field: 'generic',
				message:
					'Email not validated. Check your inbox for the confirmation email or click link below to re-send it.',
			});
		}

		// Create new tokens
		const accessToken = await signAccessToken(user[0].user_id);
		const refreshToken = await signRefreshToken(user[0].user_id);

		// Update last login
		const sql2 =
			'UPDATE profiles SET last_login=now() WHERE user_id = ?;';
		const response = await execute(sql2, user[0].user_id);
		// Return user data to frontend
		if (accessToken && refreshToken) {
			await updateRefreshTokenList(refreshToken, user[0].user_id);
			return res.status(200).json({
				auth: true,
				user: {
					username: user[0].username,
					user_id: user[0].user_id,
					email: user[0].email,
					name: user[0].name,
					birthday: user[0].birthday,
					profile_exists: user[0].profile_exists,
					location_permitted: user[0].location_permitted,
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
	const requester = await decodeUserFromAccesstoken(req);
	if (!requester)
		return res.status(401).json({
			message: 'Unauthorized',
		});

	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'No user id given',
		});
	const sql = `
				SELECT 
					username,
					email,
					birthday,
					name
				FROM 
					users 
				WHERE 
					user_id = ?
				`;
	try {
		const userData = await execute(sql, [user_id]);
		if (userData.length > 0) {
			return res.status(200).json({
				message: 'User data retrieved successfully',
				userData: userData[0],
			});
		}
		return res.status(204);
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const deleteUser = async (req: Request, res: Response) => {
	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'Incomplete information',
		});
	try {
		// Get user_id
		const decoded_user_id = await decodeUserFromAccesstoken(req);
		if (!decoded_user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		if (user_id != decoded_user_id)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Remove profile
		let sql = 'DELETE FROM profiles WHERE user_id = ?';
		let response = await execute(sql, [user_id]);

		// Delete matches
		sql = `
		DELETE FROM
			matches
		WHERE
			user1 = ?
			OR
			user2 = ?
		`;
		response = await execute(sql, [user_id, user_id]);

		// Delete likes
		sql = `
		DELETE FROM
			likes
		WHERE
			user_id = ?
			OR
			target_id = ?
		`;
		response = await execute(sql, [user_id, user_id]);

		// Delete messages
		sql = `
		DELETE FROM
			messages
		WHERE
			user_id = ?
		`;
		response = await execute(sql, [user_id]);

		// Delete blocks
		sql = `
			DELETE FROM 
				blocks 
			WHERE 
				blocker = ?
				OR
				blocked = ?
			`;
		response = await execute(sql, [user_id, user_id]);

		// Delete notifications
		sql = `
			DELETE FROM 
				notifications 
			WHERE 
				receiver_id = ?
				OR
				sender_id = ?
			`;
		response = await execute(sql, [user_id, user_id]);

		// Get user images
		sql = `
			SELECT filename FROM 
				photos 
			WHERE 
				user_id = ?
			`;
		response = await execute(sql, [user_id]);
		// Delete image files
		response.map((file) =>
			unlink(`./images/${file['filename']}`, (err) => {
				if (err) console.error(err);
			})
		);
		// Delete db entries
		sql = `
			DELETE FROM 
				photos 
			WHERE 
				user_id = ?
			`;
		response = await execute(sql, [user_id]);

		// Delete logs
		sql = `
			DELETE FROM 
				visitors 
			WHERE 
				visited_user = ?
				OR
				visiting_user = ?
			`;
		response = await execute(sql, [user_id, user_id]);

		// Delete tokens
		sql = `
			DELETE FROM 
				tokens 
			WHERE 
				user_id = ?
			`;
		response = await execute(sql, [user_id]);

		// Delete user
		sql = `
			DELETE FROM 
				users 
			WHERE 
				user_id = ?
			`;
		response = await execute(sql, [user_id]);

		if (response)
			return res.status(200).json({
				message: 'User data removed successfully',
			});
		return res.status(400).json({
			message: 'No user found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const updateUser = async (req: Request, res: Response) => {
	const { username, password, name, email, birthday } = req.body;
	const sql =
		'UPDATE users SET username=?, password=?, email=?, name=?, birthday=? WHERE user_id = ?;';
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		// Hash password
		const hash = await bcryptjs.hash(password, 10);
		const response = await execute(sql, [
			username,
			hash,
			email,
			name,
			reformatDate(birthday),
			user_id,
		]);
		if (response)
			return res.status(200).json({
				message: 'User information updated successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export const blockUser = async (req: Request, res: Response) => {
	try {
		// get user ids
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		const { blocker, blocked, reason } = req.body;

		if (!blocked || !blocker || !reason)
			return res.status(400).json({
				message: 'Missing information',
			});
		if (blocker !== user_id)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Check for duplicate block
		let sql = 'SELECT * FROM blocks WHERE blocker = ? AND blocked = ?';
		let response = await execute(sql, [blocker, blocked]);
		if (response.length > 0)
			return res.status(400).json({
				message: 'You already blocked this person',
			});
		// add to db
		sql = `
			INSERT INTO 
			blocks 
			(blocker, blocked, block_reason)
			VALUES 
			(?, ?, ?); 
			`;
		response = await execute(sql, [blocker, blocked, reason]);
		if (!response) throw new Error('Failed to write block to database');

		// Check if it's a match
		const isMatch = await findMatch(blocker, blocked);
		if (isMatch) {
			const removed = await removeMatch(blocker, blocked);
			if (!removed) throw new Error('Failed to remove match');
		}
		// Remove like
		sql = 'DELETE FROM likes WHERE user_id = ? AND target_id = ?';
		response = await execute(sql, [blocker, blocked]);
		if (!response) throw new Error('Failed to remove like');

		return res.status(200).json({
			message: 'User blocked successfully',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export const reportUser = async (req: Request, res: Response) => {
	try {
		// get user ids
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		const { reporter, reported, reason } = req.body;

		if (!reporter || !reported || !reason)
			return res.status(400).json({
				message: 'Missing information',
			});
		if (reporter !== user_id)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// add to db
		let sql = `
				INSERT INTO 
				reports 
				(reporter, reported, report_reason)
				VALUES 
				(?, ?, ?); 
				`;
		const response = await execute(sql, [reporter, reported, reason]);
		if (!response) throw new Error('Failed to save report to database');

		// Notify admin
		const responseObject = JSON.parse(JSON.stringify(response));
		const report_id = responseObject.insertId;
		sendReportMessage(report_id, reason);
		if (response)
			return res.status(200).json({
				message: 'User reported successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export const updateLocationPermission = async (req: Request, res: Response) => {
	const { location_permitted } = req.body;
	console.log(req.body);
	const sql =
		'UPDATE users SET location_permitted=? WHERE user_id = ?;';
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		const response = await execute(sql, [
			location_permitted,
			user_id
		]);
		if (response)
			return res.status(200).json({
				message: 'Location permission updated successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
export default {
	register,
	login,
	getUserInformation,
	deleteUser,
	updateUser,
};
