import { execute } from '../utilities/SQLConnect';
import { Request, Response } from 'express';
import { decodeUserFromAccesstoken } from './token';
import { locateIP } from '../utilities/helpers';

export const updateLocation = async (req: Request, res: Response) => {
	let { latitude, longitude } = req.body;
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		// Get and locate IP
		if (!latitude || !longitude) {
			const location = await locateIP(user_id, req);
			latitude = location?.ll[0] || '60.16952';
			longitude = location?.ll[1] || '24.93545';
		}
		const sql = `UPDATE
            profiles
        SET 
            latitude=?, 
            longitude=? 
        WHERE 
            user_id = ?;`;
		const response = await execute(sql, [latitude, longitude, user_id]);
		if (response)
			return res.status(200).json({
				message: 'Location updated successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
