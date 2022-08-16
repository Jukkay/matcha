import { Request, Response } from 'express';
import { OkPacket, RowDataPacket } from 'mysql';
import { reformatDate } from '../utilities/helpers';
import { execute } from '../utilities/SQLConnect';
import { decodeUserFromAccesstoken } from './token';

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
		name
	} = req.body;
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
		const sql =
			'INSERT INTO profiles(user_id, country, city, gender, birthday, looking, min_age, max_age, introduction, interests, name, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
			profile_image
		]);
		const sql2 = 'UPDATE users SET profile_exists = "1", profile_image = ? WHERE user_id = ?;';
		const response2 = await execute(sql2, [profile_image, user_id]);
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
	// no auth required

	// TODO Check that requester is not blocked by requested user

	const user_id = req.params.id;
	if (!user_id)
		return res.status(400).json({
			message: 'No user id given',
		});
	const sql = 'SELECT * FROM profiles WHERE user_id = ?';
	try {
		const profile_data = await execute(sql, [user_id]);
		if (profile_data) {
			// TODO Create notification of profile visit
			return res.status(200).json({
				message: 'Profile data retrieved successfully',
				profile: profile_data[0],
			});
		}
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
		profile_image
	} = req.body;
	console.log(req.body);
	const sql =
		'UPDATE profiles SET country=?, city=?, gender=?, birthday=?, looking=?, min_age=?, max_age=?, introduction=?, interests=?, profile_image=? WHERE user_id = ?;';
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(401).json({
				message: 'Unauthorized',
			});
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
			user_id,
		]);
		const sql2 = 'UPDATE users SET profile_exists = "1", profile_image = ? WHERE user_id = ?;';
		const response2 = await execute(sql2, [profile_image, user_id]);
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
