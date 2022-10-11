import { Request, Response } from 'express';
import { locateIP, reformatDate } from '../utilities/helpers';
import { execute } from '../utilities/SQLConnect';
import {
	validateNewProfile,
	validateUpdateProfile,
} from '../utilities/validators';
import { decodeUserFromAccesstoken } from './token';

const newProfile = async (req: Request, res: Response) => {
	validateNewProfile(req, res);
	const {
		country,
		city,
		gender,
		birthday,
		looking,
		min_age,
		max_age,
		introduction,
		interests,
		profile_image,
		name,
	} = req.body;
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

		const sql = `INSERT INTO 
				profiles
				(
					user_id, 
					country, 
					city, 
					gender, 
					birthday, 
					looking, 
					min_age, 
					max_age, 
					introduction, 
					interests, 
					name, 
					profile_image, 
					latitude, 
					longitude
				) 
			VALUES 					
				(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		const response = await execute(sql, [
			user_id,
			country,
			city,
			gender,
			reformatDate(birthday),
			looking,
			min_age,
			max_age,
			introduction,
			JSON.stringify(interests),
			name,
			profile_image,
			latitude.trim(),
			longitude.trim(),
		]);
		const sql2 = `
			UPDATE 
				users 
			SET 
				profile_exists = "1" 
			WHERE 
				user_id = ?;`;
		const response2 = await execute(sql2, [user_id]);
		if (response && response2)
			return res.status(200).json({
				message: 'Profile created',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const getProfile = async (req: Request, res: Response) => {
	try {
		// Get user_id
		const requester = await decodeUserFromAccesstoken(req);
		if (!requester)
			return res.status(401).json({
				message: 'Unauthorized',
			});

		const user_id = req.params.id;
		if (!user_id || user_id === '0')
			return res.status(400).json({
				message: 'Invalid user ID',
			});
		const sql = `
				SELECT 
					profiles.*, 
					liked.like_id AS liked,
					likes.like_id AS likes_requester,
					matches.match_id,
					blocks.block_id
				FROM 
					profiles
				LEFT JOIN
					blocks
					ON
						blocks.blocker = profiles.user_id
					AND
						blocks.blocked = ?
				LEFT JOIN
					likes
					ON
						likes.user_id = profiles.user_id
					AND
						likes.target_id = ?
				LEFT JOIN
					likes AS liked
					ON
						liked.target_id = profiles.user_id
					AND
						liked.user_id = ?
				LEFT JOIN
					matches
					ON
						(matches.user1 = profiles.user_id
						AND
						matches.user2 = ?)
					OR
						(matches.user2 = profiles.user_id
						AND
						matches.user1 = ?)					
				WHERE 
					profiles.user_id = ?
					AND
					blocks.block_id IS NULL
				`;

		const profile_data = await execute(sql, [
			requester,
			requester,
			requester,
			requester,
			requester,
			user_id,
		]);
		if (profile_data.length > 0) {
			// TODO Create notification of profile visit
			return res.status(200).json({
				message: 'Profile data retrieved successfully',
				profile: profile_data[0],
			});
		}
		return res.status(204);
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const updateProfile = async (req: Request, res: Response) => {
	validateUpdateProfile(req, res);
	const {
		country,
		city,
		gender,
		birthday,
		looking,
		min_age,
		max_age,
		introduction,
		interests,
		profile_image,
		user_latitude,
		user_longitude,
	} = req.body;
	let { latitude, longitude } = req.body;

	const sql = `
		UPDATE 
			profiles 
		SET 
			country=?, 
			city=?, 
			gender=?, 
			birthday=?, 
			looking=?, 
			min_age=?, 
			max_age=?, 
			introduction=?, 
			interests=?, 
			profile_image=?, 
			latitude=?, 
			longitude=?, 
			user_latitude=?, 
			user_longitude=? 
		WHERE 
			user_id = ?;`;
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
		const response = await execute(sql, [
			country,
			city,
			gender,
			reformatDate(birthday),
			looking,
			min_age,
			max_age,
			introduction,
			JSON.stringify(interests),
			profile_image,
			latitude.trim(),
			longitude.trim(),
			user_latitude ? user_latitude.trim() : '',
			user_longitude ? user_longitude.trim() : '',
			user_id,
		]);
		if (response) {
			const sql2 = `
				UPDATE 
					users 
				SET 
					profile_exists = "1" 
				WHERE 
					user_id = ?;`;
			await execute(sql2, [user_id]);
			return res.status(200).json({
				message: 'Profile updated successfully',
			});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const deleteProfile = async (req: Request, res: Response) => {
	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'Incomplete information',
		});
	try {
		// Get user_id
		const decoded_user_id = await decodeUserFromAccesstoken(req);
		if (!decoded_user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		if (user_id != decoded_user_id)
			return res.status(400).json({
				message: 'ID mismatch. Are you doing something shady?',
			});
		// Remove profile
		const sql = `
			DELETE FROM 
				profiles 
			WHERE 
				user_id = ?`;
		const response = await execute(sql, [user_id]);
		const sql2 = `
			UPDATE 
				users 
			SET 
				profile_exists = "0" 
			WHERE 
				user_id = ?;`;
		const response2 = await execute(sql2, [user_id]);
		if (response && response2)
			return res.status(200).json({
				message: 'Profile removed successfully',
			});
		return res.status(400).json({
			message: 'No profile found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

export default { newProfile, getProfile, updateProfile, deleteProfile };
