import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';

export const createMatch = async (user1: number, user2: number) => {
	// Check for duplicates
	const duplicate = await findMatch(user1, user2);
	if (duplicate) return;
	// Create Match
	const sql = `
				INSERT INTO
					matches
					(
						user1, 
						user2
					)
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
		const matches = await execute(sql, [
			user_id,
			user_id,
			user_id,
			user_id,
		])
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
	const sql = `
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
	// get match id
	let sql = `
		SELECT
			match_id
		FROM
			matches
		WHERE
			(user1 = ? AND user2 = ?)
			OR
			(user2 = ? AND user1 = ?)
		`;
	let response = await execute(sql, [user1, user2, user1, user2]);

	// Delete match
	const match_id = response[0]?.match_id;
	sql = `
		DELETE FROM
			matches
		WHERE
			match_id = ?
		`;
	response = await execute(sql, [match_id]);

	// Delete likes
	sql = `
		DELETE FROM
			likes
		WHERE
			(user_id = ? AND target_id = ?)
			OR
			(user_id = ? AND target_id = ?)
		`;
	response = await execute(sql, [user1, user2, user2, user1]);

	// Delete messages
	sql = `
		DELETE FROM
			messages
		WHERE
			match_id = ?
		`;
	response = await execute(sql, [match_id]);
	return response;
};

export default { getAllMatches };
