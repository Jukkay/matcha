import { Request, Response } from 'express';
import { OkPacket, RowDataPacket } from 'mysql';
import { execute } from '../utilities/SQLConnect';
import { createMatch, findMatch, removeMatch } from './match';
import { decodeUserFromAccesstoken } from './token';

const updateFamerating = async(liker: string, liked: string) => {
	const likerFamerating = await calculateFamerating(liker)
	const sql = `UPDATE profiles SET famerating = ? WHERE user_id = ?`;
	await execute(sql, [likerFamerating, liker]);
	const likedFamerating = await calculateFamerating(liked)
	await execute(sql, [likedFamerating, liked]);
	console.log('Famerating updated: ', likerFamerating, likedFamerating);
}

const calculateFamerating = async(user_id: string) => {
	// get number of likes received during last month
	let sql = 'SELECT COUNT(*) AS like_count FROM likes WHERE target_id = ? AND DATE(like_date) BETWEEN (CURRENT_DATE - INTERVAL 1 MONTH) AND CURRENT_DATE';
	const likesReceived = await execute(sql, [user_id]);
	
	// get number matches during last month
	sql = 'SELECT COUNT(*) AS match_count FROM matches WHERE user1 = ? OR user2 = ? AND DATE(match_date) BETWEEN (CURRENT_DATE - INTERVAL 1 MONTH) AND CURRENT_DATE';
	const matches = await execute(sql, [user_id, user_id]);

	// get number of messages during last month
	sql = 'SELECT COUNT(*) AS message_count FROM messages WHERE user_id = ? AND DATE(message_time) BETWEEN (CURRENT_DATE - INTERVAL 1 MONTH) AND CURRENT_DATE';
	const messages = await execute(sql, [user_id]);

	// Calculate famerating
	if (!likesReceived[0].like_count || !matches[0].match_count || !messages[0].message_count) return 0
	else return likesReceived[0].like_count as number + (messages[0].message_count as number / matches[0].match_count as number)


}
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
			return res.status(401).json({
				message: 'Unauthorized',
			});
		if (user_id !== liker)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Check for duplicate like
		let sql = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ?';
		let response = await execute(sql, [liker, liked]);
		if (response.length > 0)
			return res.status(400).json({
				message: 'You already liked this person',
			});

		// Check if liked likes liker
		sql = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ?';
		response = await execute(sql, [liked, liker]);
		if (response.length > 0) {
			// Create match
			const match = await createMatch(parseInt(liker), parseInt(liked));
			if (!match)
				return res.status(200).json({
					match: true,
					message: 'Match already exists',
				});
			// TODO Send notification

			// Update famerating
			await updateFamerating(liker, liked)

			return res.status(200).json({
				match: true,
				message: 'Match',
			});
		}
		// Create like
		sql = 'INSERT INTO likes(user_id, target_id) VALUES (?, ?)';
		response = await execute(sql, [liker, liked]);
		if (response.length > 0) {
			// Update famerating
			await updateFamerating(liker, liked)

			return res.status(200).json({
				match: false,
				message: 'Like added successfully',
			});
		}
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
	const sql = 'SELECT user_id FROM likes WHERE target_id = ?';
	try {
		const likes = await execute(sql, [user_id]);
		if (likes)
			return res.status(200).json({
				message: 'Like history retrieved successfully',
				profile: likes,
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
			return res.status(401).json({
				message: 'Unauthorized',
			});
		if (user_id !== liker)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
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
		// Remove like
		const sql = 'DELETE FROM likes WHERE user_id = ? AND target_id = ?';
		const response = await execute(sql, [user_id, liked]);

		if (response.length > 0)
			return res.status(200).json({
				message: 'Like removed successfully',
			});
		return res.status(400).json({
			message: 'No like found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export default { addNewLike, getLikesForProfile, removeLike };
