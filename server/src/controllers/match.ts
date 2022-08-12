import { Request, Response } from 'express';
import { OkPacket, RowDataPacket } from 'mysql';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';

export const createMatch = async (user1: number, user2: number) => {
	// Check for duplicates
	const duplicate = await findMatch(user1, user2);
	if (duplicate) return;
	// Create Match
	const sql = 'INSERT INTO matches(user1, user2) VALUES (?, ?)';
	const response = await execute(sql, [user1, user2]);

	if (response) {
		// TODO Send notification

		return response;
	}
};

const getAllMatches = async (req: Request, res: Response) => {
	// no auth required
	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'No user id given',
		});
	const sql = 'SELECT * FROM profiles WHERE user_id = ?';
	try {
		const profile_data = await execute(sql, [user_id]);
		if (profile_data)
			return res.status(200).json({
				message: 'Profile data retrieved successfully',
				profile: profile_data[0],
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

export const findMatch = async (user1: number, user2: number) => {
	// Check if it's a match
	const sql =
		'SELECT * FROM matches WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)';
	const response = await execute(sql, [user1, user2, user2, user1]);
	return response.length > 0 ? true : false;
};

export const removeMatch = async (user1: number, user2: number) => {
	let sql =
		'DELETE FROM matches WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)';
	let response = await execute(sql, [user1, user2, user2, user1]);
    sql = 'DELETE FROM likes WHERE (user_id = ? AND target_id = ?) OR (user_id = ? AND target_id = ?)';
    response = await execute(sql, [user1, user2, user2, user1]);
	return response;
};

export default { getAllMatches };
