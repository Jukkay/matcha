import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';

export const updateProfileImage = async (req: Request, res: Response) => {
	try {
        const {
            profile_image
        } = req.body;
		if (!profile_image) {
			return res.status(400).json({
				message: 'Missing filename',
			});
		}

		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
        return res.status(401).json({
            message: 'Unauthorized',
        });
        const sql = `
        UPDATE 
            profiles 
        SET 
            profile_image=?
        WHERE 
            user_id = ?;`;
		const response = await execute(sql, [
			profile_image,
			user_id,
		]);
		if (response) {
			return res.status(200).json({
				message: 'Profile image updated successfully',
			});
		}
		return res.status(500).json({
			message: 'Failed to save to database',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
