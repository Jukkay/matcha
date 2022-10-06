import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import { reformatDate } from './helpers';

export const validateRegistrationInput = async (
	req: Request,
	res: Response
) => {
	const { username, password, confirmPassword, name, email, birthday } =
		req.body;

	// check exists

	if (!username)
		return res.status(400).json({
			field: 'username',
			message: 'Missing username.',
		});
	if (!password)
		return res.status(400).json({
			field: 'password',
			message: 'Missing password.',
		});
	if (!confirmPassword)
		return res.status(400).json({
			field: 'confirmPassword',
			message: 'Missing password confirmation.',
		});
	if (!email)
		return res.status(400).json({
			field: 'email',
			message: 'Missing email.',
		});
	if (!birthday)
		return res.status(400).json({
			field: 'birthday',
			message: 'Missing birthday.',
		});

	// check input length

	if (username.length > 32 || username.length < 3)
		return res.status(400).json({
			field: 'username',
			message: 'Username must be between 3 and 32 characters long.',
		});
	if (password.length > 255 || password.length < 8)
		return res.status(400).json({
			field: 'password',
			message: 'Password must be between 8 and 255 characters long.',
		});
	if (email.length > 320 || email.length < 6)
		return res.status(400).json({
			field: 'email',
			message: 'Email must be between 6 and 320 characters long.',
		});
	if (name?.length > 255)
		return res.status(400).json({
			field: 'name',
			message: 'Name has maximum length of 255 characters.',
		});
	if (birthday.length != 10)
		return res.status(400).json({
			field: 'birthday',
			message: 'Invalid birthday length.',
		});

	// check username validity
	if (!/^[a-zA-Z0-9.]{3,32}$/i.test(username))
		return res.status(400).json({
			field: 'username',
			message:
				'Invalid username. Only characters a-z and 0-9 are allowed.',
		});
	// check email validity
	if (!/^\S+@\S+\.\S+$/i.test(email))
		return res.status(400).json({
			field: 'email',
			message: 'Invalid email address.',
		});
	// check password match
	if (password !== confirmPassword)
		return res.status(400).json({
			field: 'confirmPassword',
			message: "Passwords don't match.",
		});

	// check password validity
	if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/i.test(password))
		return res.status(400).json({
			field: 'password',
			message:
				'Password must include at least one number and one uppercase and lowercase characters.',
		});

	// Check birthday validity
	const now = new Date().getTime();
	const bd = new Date(birthday).getTime();
	const age = (now - bd) / (1000 * 60 * 60 * 24) / 365;
	if (age < 18)
		return res.status(400).json({
			field: 'birthday',
			message:
				'You seem to be too young. Must be at least 18 years old to register.',
		});

	// check username exists
	const sql = 'SELECT username FROM users WHERE username = ?;';
	const usercheck = await execute(sql, [username]);
	if (usercheck.length)
		return res.status(400).json({
			field: 'username',
			message: 'Username is already taken.',
		});
	// check email exists
	const sql2 = 'SELECT email FROM users WHERE email = ?;';
	const emailcheck = await execute(sql2, [email]);
	if (emailcheck.length)
		return res.status(400).json({
			field: 'email',
			message: 'Email is associated with an existing account.',
		});
};

export const validateNewProfile = (req: Request, res: Response) => {
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
		latitude,
		longitude,
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
	if (
		country.length > 56 ||
		city.length > 85 ||
		gender.length > 32 ||
		!reformatDate(birthday) ||
		looking.length > 32 ||
		isNaN(min_age) ||
		isNaN(max_age) ||
		introduction.length > 4096 ||
		!JSON.stringify(interests) ||
		name.length > 255 ||
		profile_image.length > 255
	)
		return res.status(400).json({
			message: 'Incorrect input',
		});
	if (latitude?.length > 32 || longitude?.length > 32)
		return res.status(400).json({
			message: 'Incorrect input',
		});
};

export const validateUpdateProfile = (req: Request, res: Response) => {
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
		latitude,
		longitude,
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
		!profile_image
	)
		return res.status(400).json({
			message: 'Incomplete profile information',
		});
	if (
		country.length > 56 ||
		city.length > 85 ||
		gender.length > 32 ||
		!reformatDate(birthday) ||
		looking.length > 32 ||
		isNaN(min_age) ||
		isNaN(max_age) ||
		introduction.length > 4096 ||
		!JSON.stringify(interests) ||
		profile_image.length > 255
	)
		return res.status(400).json({
			message: 'Incorrect input',
		});
	if (user_latitude?.length > 32 || user_longitude?.length > 32)
		return res.status(400).json({
			message: 'Incorrect input',
		});
	if (latitude?.length > 32 || longitude?.length > 32)
		return res.status(400).json({
			message: 'Incorrect input',
		});
};

export const validateSearchParams = (req: Request, res: Response) => {
	const { looking, gender, min_age, max_age, country, city } = req.body.data;
	if (!gender || !min_age || !max_age || !looking)
		return res.status(400).json({
			message: 'Insufficient search parameters',
		});
	if (
		country?.length > 56 ||
		city?.length > 85 ||
		gender.length > 32 ||
		looking.length > 32 ||
		isNaN(min_age) ||
		isNaN(max_age)
	)
		return res.status(400).json({
			message: 'Incorrect input',
		});
};

export const validateLogin = (req: Request, res: Response) => {
	const { username, password } = req.body;
	if (!username)
		return res.status(400).json({
			auth: false,
			field: 'username',
			message: 'Missing username',
		});
	if (!password)
		return res.status(400).json({
			auth: false,
			field: 'password',
			message: 'Missing password',
		});
	if (username.length > 255 || password.length > 255)
		return res.status(400).json({
			auth: false,
			field: 'generic',
			message: 'Incorrect input',
		});
};

export const validateUpdateUser = (req: Request, res: Response) => {
	const { username, password, name, email, birthday } = req.body;
	if (!username || !password || !name || !email || !birthday)
		return res.status(400).json({
			message: 'Incomplete user information',
		});
	if (
		username.length > 32 ||
		password.length > 255 ||
		name.length > 255 ||
		!reformatDate(birthday)
	)
		return res.status(400).json({
			message: 'Incorrect input',
		});
};
