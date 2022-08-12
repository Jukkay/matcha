import { Request, Response } from 'express';
import { OkPacket, RowDataPacket } from 'mysql';
import { execute } from '../utilities/SQLConnect';
import { createMatch, findMatch, removeMatch } from './match';
import { decodeUserFromAccesstoken } from './token';

const addNewLike = async (req: Request, res: Response) => {
	const { liker, liked } = req.body;
	if (!liker || !liked)
		return res.status(400).json({
			message: 'Incomplete like information',
		});
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(500).json({
				message: 'Cannot parse user_id',
			});
		if (user_id !== liker)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Check if it's a match
		const sql =
			'SELECT * FROM likes WHERE user_id = ? AND WHERE target_id = ?';
		const response = await execute(sql, [liked, user_id]);
		if (response) {
			// TODO create match
			const match = await createMatch(parseInt(user_id), parseInt(liked));
			if (!match) throw new Error('Failed to create match');
			// TODO Send notification

			return res.status(200).json({
				match: true,
				message: 'Match',
			});
		}
		// Create like
		const sql2 = 'INSERT INTO likes(user_id, target_id) VALUES (?, ?)';
		const response2 = await execute(sql2, [user_id, liked]);

		if (response2)
			return res.status(200).json({
				match: false,
				message: 'Like added successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

// Is this needed?
const getLikesForProfile = async (req: Request, res: Response) => {
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

const removeLike = async (req: Request, res: Response) => {
	const { liker, liked } = req.body;
	if (!liker || !liked)
		return res.status(400).json({
			message: 'Incomplete like information',
		});
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(500).json({
				message: 'Cannot parse user_id',
			});
		if (user_id !== liker)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Remove like
		const sql =
			'DELETE FROM likes WHERE user_id = ? AND WHERE target_id = ?';
		const response = await execute(sql, [user_id, liked]);

		// Check if it's a match
		const isMatch = await findMatch(parseInt(user_id), parseInt(liked));
		if (isMatch) {
			// TODO remove match
			const removed = await removeMatch(
				parseInt(user_id),
				parseInt(liked)
			);
			if (!removed) throw new Error('Failed to remove match');

			return res.status(200).json({
				message: 'Like and match removed successfully',
			});
		}
		if (response)
			return res.status(200).json({
				message: 'Like removed successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export default { addNewLike, getLikesForProfile, removeLike };
