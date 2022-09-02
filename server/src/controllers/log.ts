import { execute } from '../utilities/SQLConnect';
import { Request, Response } from 'express';
import { decodeUserFromAccesstoken } from './token';

export const logVisitor = async (req: Request, res: Response) => {
	try {
		const { visited_user, visiting_user, username } = req.body;
        if (!visited_user ||
            !visiting_user ||
            !username)
            return res.status(400).json({
                message: 'Incomplete log information'
            })
		const sql =
			'INSERT INTO visitors(visited_user, visiting_user, username) VALUES (?, ?, ?)';
		const logged = await execute(sql, [visited_user, visiting_user, username]);
		if (logged) {
			console.log('Visit logged');
			return res.status(200).json({
				message: 'Visit logged',
			});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export const getVisitorLog = async (req: Request, res: Response) => {
	const requestedID = req.params.id;
	try {
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id || !requestedID)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		if (user_id != requestedID)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
			const sql =
			'SELECT name, birthday, city, country, profile_image, user_id, interests FROM profiles INNER JOIN visitors ON profiles.user_id = visitors.visiting_user WHERE visited_user = ?';
		const log = await execute(sql, [user_id]);
		if (log.length > 0)
			return res.status(200).json({
				message: 'Visitor log retrieved successfully',
				log: log,
			});
		return res.status(204).json({
			message: 'No user found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};


export const getRecentProfiles = async (req: Request, res: Response) => {
	try {
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		const sql =
		'SELECT name, birthday, city, country, profile_image, user_id, interests FROM profiles INNER JOIN visitors ON profiles.user_id = visitors.visited_user WHERE visiting_user = ?';
		const log = await execute(sql, [user_id]);
		console.log(log)
		if (log.length > 0)
			return res.status(200).json({
				message: 'Profile visit history retrieved successfully',
				log: log,
			});
		return res.status(204).json({
			message: 'No user found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
