import { Request, Response } from "express";
import { execute } from '../utilities/SQLConnect';

export const validateRegistrationInput = async(req: Request, res: Response) => {
	const { username, password, confirmPassword, name, email } = req.body

	// check exists

	if (!username)
		return res.status(400).json({
			field: "username",
			message: "Missing username."
		})
	if (!password)
		return res.status(400).json({
			field: "password",
			message: "Missing password."
		})
	if (!confirmPassword)
		return res.status(400).json({
			field: "confirmPassword",
			message: "Missing password confirmation."
		})
	if (!email)
		return res.status(400).json({
			field: "email",
			message: "Missing email."
		})

	// check input length

	if (username.length > 32 || username.length < 3)
		return res.status(400).json({
			field: "username",
			message: "Username must be between 3 and 32 characters long."
		})
	if (password.length > 255 || password.length < 8)
		return res.status(400).json({
			field: "password",
			message: "Password must be between 8 and 255 characters long."
		})
	if (email.length > 320 || email.length < 6)
		return res.status(400).json({
			field: "email",
			message: "Email must be between 6 and 320 characters long."
		})
	if (name?.length > 255)
		return res.status(400).json({
			field: "name",
			message: "Name has maximum length of 255 characters."
		})

	// check username validity
	if (!/^[a-z0-9.]{3,32}$/i.test(username))
		return res.status(400).json({
			field: "username",
			message: "Invalid username. Only characters a-z and 0-9 are allowed."
		})
	// check email validity
	if (!/^\S+@\S+\.\S+$/i.test(email))
		return res.status(400).json({
			field: "email",
			message: "Invalid email address."
		})
	// check password match
	if (password !== confirmPassword)
		return res.status(400).json({
			field: "confirmPassword",
			message: "Passwords don't match."
		})

	// check password validity
	if(!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/i.test(password))
		return res.status(400).json({
			field: "password",
			message: "Password must include at least one number and one uppercase and lowercase characters."
		})
	// check username exists
	const sql = "SELECT username FROM users WHERE username = ?;"
	const usercheck = await execute(sql, [username])
	if (usercheck.length)
		return res.status(400).json({
			field: "username",
			message: "Username is already taken."
		})
	// check email exists
	const sql2 = "SELECT email FROM users WHERE email = ?;"
	const emailcheck = await execute(sql2, [email])
	if (emailcheck.length)
		return res.status(400).json({
			field: "email",
			message: "Email is associated with an existing account."
		})
}