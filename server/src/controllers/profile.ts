import { Request, Response } from 'express';
import { OkPacket, RowDataPacket } from 'mysql';
import { locateIP, reformatDate } from '../utilities/helpers';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';
import geoip from 'fast-geoip';
import requestIP from 'request-ip';

const newProfile = async (req: Request, res: Response) => {
	console.log(req.body);
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
	if (
		!country ||
		!city ||
		!gender ||
		!birthday ||
		!looking ||
		!min_age ||
		!max_age ||
		!introduction ||
		!interests ||
		!name ||
		!profile_image
	)
		return res.status(400).json({
			message: 'Incomplete profile information',
		});
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		// Get and locate IP
		if (!latitude || !longitude) {
			const location = await locateIP(req);
			latitude = location?.ll[0] || '60.16952';
			longitude = location?.ll[1] || '24.93545';
		}

		const sql =
			'INSERT INTO profiles(user_id, country, city, gender, birthday, looking, min_age, max_age, introduction, interests, name, profile_image, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
			latitude,
			longitude,
		]);
		const sql2 =
			'UPDATE users SET profile_exists = "1" WHERE user_id = ?;';
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
	// Get user_id
	const requester = await decodeUserFromAccesstoken(req);
	if (!requester)
		return res.status(401).json({
			message: 'Unauthorized',
		});
	// TODO Check that requester is not blocked by requested user

	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'No user id given',
		});
	const sql = `
				SELECT 
					profiles.*, 
					likes.like_id,
					matches.match_id
				FROM 
					profiles 
				LEFT JOIN
					likes
					ON
					likes.target_id = profiles.user_id
					AND
					likes.user_id = ?
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
				`;
	try {
		const profile_data = await execute(sql, [requester, requester, requester, user_id]);
		console.log(profile_data);
		if (profile_data.length > 0) {
			// TODO Create notification of profile visit
			return res.status(200).json({
				message: 'Profile data retrieved successfully',
				profile: profile_data[0],
			});
		}
		return res.status(204)
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const updateProfile = async (req: Request, res: Response) => {
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
	} = req.body;
	let { latitude, longitude } = req.body;
	console.log(req.body);
	const sql =
		'UPDATE profiles SET country=?, city=?, gender=?, birthday=?, looking=?, min_age=?, max_age=?, introduction=?, interests=?, profile_image=?, latitude=?, longitude=? WHERE user_id = ?;';
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
		// Get and locate IP
		if (!latitude || !longitude) {
			const location = await locateIP(req);
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
			latitude,
			longitude,
			user_id,
		]);
		const sql2 =
			'UPDATE users SET profile_exists = "1" WHERE user_id = ?;';
		const response2 = await execute(sql2, [user_id]);
		if (response && response2)
			return res.status(200).json({
				message: 'Profile updated successfully',
			});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};

const deleteProfile = async (req: Request, res: Response) => {
	// Get user_id
	const user_id = await decodeUserFromAccesstoken(req);
	if (!user_id)
		return res.status(401).json({
			message: 'Unauthorized',
		});
	console.log('in deleteProfile. Function incomplete.');
	return res.status(200).json({
		message: 'Message',
	});
};

export default { newProfile, getProfile, updateProfile, deleteProfile };
