import { Request, Response } from 'express';
import { convertMAX_AGE, convertMIN_AGE } from '../utilities/helpers';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';

export const searchProfiles = async (req: Request, res: Response) => {
	const {
		looking,
		gender,
		min_age,
		max_age,
		min_famerating,
		max_famerating,
		country,
		city,
		interests
	} = req.body.data;


	if (!gender || !min_age || !max_age || !looking)
		return res.status(400).json({
			message: 'Insufficient search parameters',
		});

	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});

		// Convert min_age and max_age to date strings
		const minDate = convertMIN_AGE(min_age);
		const maxDate = convertMAX_AGE(max_age);
		// Search logic
		let sql;
		let results;
		if (min_famerating && max_famerating && country && city && interests !== '[]') {
			console.log('Advanced search with:', req.body.data)
			console.log(interests)
			// Do advanced search
			sql = `
			SELECT 
				profiles.*,
				likes.like_id,
				blocks.block_id,
				JSON_OVERLAPS(profiles.interests, ?) AS interests_match
			FROM
				profiles
			LEFT JOIN
				likes
				ON
					likes.target_id = profiles.user_id
					AND
					likes.user_id = ?
			LEFT JOIN
				blocks
				ON
					blocks.blocked = profiles.user_id
					AND
					blocks.blocker = ?
			WHERE 
				DATE(birthday) 
					BETWEEN ? AND ? 
				AND 
				famerating 
					BETWEEN ? AND ?
				AND
				gender = ? 
				AND 
				profiles.user_id != ? 
				AND 
				looking = ?
				AND
				country = ?
				AND
				city = ?
				AND
				blocks.block_id IS NULL
			HAVING 
				interests_match = 1
			ORDER BY 
				famerating DESC
			`;

			results = await execute(sql, [
				JSON.stringify(interests),
				user_id,
				user_id,
				maxDate,
				minDate,
				min_famerating,
				max_famerating,
				looking,
				user_id,
				gender,
				country,
				city,
			]);
		} else {
			// Do basic search
			sql = `
			SELECT 
				profiles.*,
				likes.like_id,
				blocks.block_id
			FROM
				profiles
			LEFT JOIN
				likes
				ON
					likes.target_id = profiles.user_id
					AND
					likes.user_id = ?
			LEFT JOIN
				blocks
				ON
					blocks.blocked = profiles.user_id
					AND
					blocks.blocker = ?
			WHERE 
				DATE(birthday) 
					BETWEEN ? AND ? 
				AND
				gender = ? 
				AND 
				profiles.user_id != ? 
				AND 
				looking = ?
				AND
				blocks.block_id IS NULL
			ORDER BY 
				famerating DESC
			`;

			results = await execute(sql, [
				user_id,
				user_id,
				maxDate,
				minDate,
				looking,
				user_id,
				gender,
			]);
		}

		console.log('Results: ', results);
		if (results.length > 0) {
			// TODO Create notification of profile visit
			return res.status(200).json({
				message: 'Profile data retrieved successfully',
				results: results,
			});
		}
		return res.status(204).json({
			message: 'No matching profiles found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
