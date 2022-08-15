import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';

export const searchProfiles = async (req: Request, res: Response) => {
	console.log('Search: ',req.body.search);
	const { gender, min_age, max_age } = req.body.search;
	if (!gender || !min_age || !max_age)
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
		const sql =
			'SELECT * FROM profiles WHERE gender = ? AND age >= ? AND age <= ? AND user_id != ?';
		const results = await execute(sql, [gender, min_age, max_age, user_id]);
		console.log('Results: ',results);
		if (results) {
			// TODO Create notification of profile visit
			return res.status(200).json({
				message: 'Profile data retrieved successfully',
				results: results,
			});
		}
		return res.status(400).json({
			message: 'No matching profiles found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
