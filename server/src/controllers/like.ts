import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import { createMatch, findMatch, removeMatch } from './match';
import { decodeUserFromAccesstoken } from './token';

const updateFamerating = async (liker: string, liked: string) => {
	const likerFamerating = await calculateFamerating(liker);
	const sql = `UPDATE profiles SET famerating = ? WHERE user_id = ?`;
	await execute(sql, [likerFamerating, liker]);
	const likedFamerating = await calculateFamerating(liked);
	await execute(sql, [likedFamerating, liked]);
};

const calculateFamerating = async (user_id: string) => {
	// get number of likes received during last month
	let sql = `
		SELECT
			COUNT(*) AS like_count 
		FROM 
			likes 
		WHERE 
			target_id = ? 
			AND 
			DATE(like_date) 
				BETWEEN (CURRENT_DATE - INTERVAL 1 MONTH) AND CURRENT_DATE`;
	const likesReceived = await execute(sql, [user_id]);

	// get number matches during last month
	sql = `
		SELECT 
			COUNT(*) AS match_count 
		FROM 
			matches 
		WHERE 
			user1 = ? 
			OR 
			user2 = ? 
			AND 
			DATE(match_date) 
				BETWEEN (CURRENT_DATE - INTERVAL 1 MONTH) AND CURRENT_DATE`;
	const matches = await execute(sql, [user_id, user_id]);

	// get number of messages during last month
	sql = `
		SELECT 
			COUNT(*) AS message_count 
		FROM 
			messages 
		WHERE 
			user_id = ? 
			AND 
			DATE(message_time) 
				BETWEEN (CURRENT_DATE - INTERVAL 1 MONTH) AND CURRENT_DATE`;
	const messages = await execute(sql, [user_id]);

	// Calculate famerating
	let messagesPerMatch;
	if (messages[0].message_count && matches[0].match_count)
		messagesPerMatch = ((messages[0].message_count as number) /
			matches[0].match_count) as number;
	else messagesPerMatch = 0;
	const famerating =
		(likesReceived[0].like_count as number) + messagesPerMatch;
	if (famerating > 1000) return 1000;
	return famerating;
};
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
		let sql = `
			SELECT 
				* 
			FROM 
				likes 
			WHERE 
				user_id = ? 
				AND 
				target_id = ?`;
		let response = await execute(sql, [liker, liked]);
		if (response.length > 0)
			return res.status(400).json({
				message: 'You already liked this person',
			});
		// Check if liked likes liker
		sql = `
			SELECT 
				* 
			FROM 
				likes 
			WHERE 
				user_id = ? 
				AND 
				target_id = ?`;
		response = await execute(sql, [liked, liker]);
		if (response.length > 0) {
			// Create like
			sql = `
				INSERT INTO 
					likes
					(
						user_id, 
						target_id
					) 
				VALUES 
					(?, ?)`;
			response = await execute(sql, [liker, liked]);
			// Create match
			const match = await createMatch(parseInt(liker), parseInt(liked));
			if (!match)
				return res.status(200).json({
					match: true,
					message: 'Match already exists',
				});

			// Update famerating
			await updateFamerating(liker, liked);

			return res.status(200).json({
				match: true,
				message: 'Match',
			});
		}
		// Create like
		sql = `
			INSERT INTO 
				likes
				(
					user_id, 
					target_id
				) 
			VALUES 
				(?, ?)`;
		response = await execute(sql, [liker, liked]);
		if (response) {
			// Update famerating
			await updateFamerating(liker, liked);

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

const getLikerProfiles = async (req: Request, res: Response) => {
	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'No user id given',
		});
	const sql = `
				SELECT
					*
				FROM 
					likes 
				INNER JOIN
					profiles
					ON
					profiles.user_id = likes.user_id
				WHERE 
					likes.target_id = ?
				ORDER BY
					likes.like_date DESC
				LIMIT 15
				`;
	try {
		const likes = await execute(sql, [user_id]);
		if (likes.length > 0)
			return res.status(200).json({
				message: 'Like history retrieved successfully',
				profiles: likes,
			});
		return res.status(204).json({
			message: 'No likers found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export const getProfilesUserLikes = async (req: Request, res: Response) => {
	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'No user id given',
		});
	const sql = `
				SELECT
					*
				FROM 
					likes 
				INNER JOIN
					profiles
					ON
					profiles.user_id = likes.target_id
				WHERE 
					likes.user_id = ?
				ORDER BY
					likes.like_date DESC
				LIMIT 15
				`;
	try {
		const likes = await execute(sql, [user_id]);
		if (likes.length > 0)
			return res.status(200).json({
				message: 'Like history retrieved successfully',
				profiles: likes,
			});
		return res.status(204).json({
			message: 'No likes found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const removeLike = async (req: Request, res: Response) => {
	const { liker, liked } = req.query;
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
		if (user_id != liker)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Check if it's a match
		const isMatch = await findMatch(
			parseInt(user_id),
			parseInt(liked as string)
		);
		if (isMatch) {
			// TODO remove match
			const removed = await removeMatch(
				parseInt(user_id),
				parseInt(liked as string)
			);
			if (!removed) throw new Error('Failed to remove match');

			return res.status(200).json({
				message: 'Like and match removed successfully',
			});
		}
		// Remove like
		const sql = `
			DELETE FROM 
				likes 
			WHERE 
				user_id = ? 
				AND 
				target_id = ?`;
		const response = await execute(sql, [user_id, liked]);
		// Update famerating
		await updateFamerating(liker, liked as string);
		if (response)
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

export default { addNewLike, getLikerProfiles, removeLike };
