import { Request, Response } from 'express';
import { OkPacket, RowDataPacket } from 'mysql';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';

export const createMatch = async (user1: number, user2: number) => {
	// Check for duplicates
	const duplicate = await findMatch(user1, user2);
	if (duplicate) return;
	// Create Match
	const sql = `
				INSERT INTO
					matches(user1, user2)
				VALUES
					(?, ?)
				`;
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
	const sql = `
				SELECT
					matches.*,
					p1.profile_image AS image1,
					p1.name AS name1,
					p2.profile_image AS image2,
					p2.name AS name2
				FROM
					matches
				INNER JOIN
					profiles AS p1
						ON p1.user_id = matches.user1
				INNER JOIN
					profiles AS p2
						ON p2.user_id = matches.user2
				WHERE
					matches.user1 = ?
					OR
					matches.user2 = ?
				ORDER BY
					matches.match_date DESC
				`;
	try {
		const matches = await execute(sql, [user_id, user_id, user_id, user_id]);
		console.log(matches);
		if (matches.length > 0)
			return res.status(200).json({
				message: 'Matches retrieved successfully',
				matches: matches,
			});
		return res.status(204).json({
			message: 'No matches found',
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
		`
		SELECT
			*
		FROM
			matches
		WHERE
			(user1 = ? AND user2 = ?)
			OR
			(user1 = ? AND user2 = ?)
		`;
	const response = await execute(sql, [user1, user2, user2, user1]);
	return response.length > 0 ? true : false;
};

export const removeMatch = async (user1: number, user2: number) => {
	let sql =
		`
		DELETE FROM
			matches
		WHERE
			(user1 = ? AND user2 = ?)
			OR
			(user1 = ? AND user2 = ?)
		`;
	let response = await execute(sql, [user1, user2, user2, user1]);
    sql = `
		DELETE FROM
			likes
		WHERE
			(user_id = ? AND target_id = ?)
			OR
			(user_id = ? AND target_id = ?)
		`;
    response = await execute(sql, [user1, user2, user2, user1]);
	return response;
};

export const removeMatchEndpoint = async (req: Request, res: Response) => {
	try {
		const { user1, user2 } = req.body;
		if (!user1 || !user2)
		return res.status(400).json({
			message: 'Incomplete match information',
		});
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		if (user_id !== user1 || user_id !== user2)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		const response = await removeMatch(user1, user2);
		if (response)
			return res.status(200).json({
				message: 'Match removed successfully',
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

export default { getAllMatches, removeMatchEndpoint};
