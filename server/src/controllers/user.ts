import { NextFunction, Request, Response } from "express";
import { execute } from '../utilities/SQLConnect';
import bcryptjs from "bcryptjs";
import { signEmailToken, signUserToken } from "../utilities/promisifyJWT";
import { sendEmailVerification } from "../utilities/sendEmailVerification";
import { validateRegistrationInput } from "../utilities/validators";

const register = async(req: Request, res: Response) => {

	try {
		const validationResponse = await validateRegistrationInput(req, res)
		if (validationResponse !== undefined)
			return
		const { username, password, name, email } = req.body
		const hash = await bcryptjs.hash(password, 10)
		const sql = `INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?);`
		const result = await execute(sql, [username, hash, email, name])
		const email_token = await signEmailToken(email)
		await sendEmailVerification(req.body.email, email_token)
		return res.status(201).json({
			message: 'User added successfully'
		})
	}
	catch (error) {
		let errorMessage
		if (error instanceof Error)
			errorMessage = error.message
		else
			errorMessage = 'Registration failed. Unknown error.'
		return res.status(500).json({
				message: errorMessage
		})
	}
}

export const login = async(req: Request, res: Response) => {

	try {
		const { username, password } = req.body
		if (!username) return res.status(400).json({
			auth: false,
			field: 'username',
			message: 'Missing username'
		})
		if (!password) return res.status(400).json({
			auth: false,
			field: 'password',
			message: 'Missing password'
		})
		const sql = `SELECT user_id, username, password, validated FROM users WHERE username = ?;`
		const user = await execute(sql, username)
		if (!user[0]) {
			return res.status(401).json({
				auth: false,
				field: 'username',
				message: 'Invalid user'
			})
		}
		if (user[0].validated != true) {
			return res.status(401).json({
				auth: false,
				field: 'generic',
				message: 'Email not validated'
			})
		}
		const match = await bcryptjs.compare(password, user[0].password)
		if (!match) {
			return res.status(401).json({
				auth: false,
				field: 'password',
				message: 'Invalid password'
			})
		}

		const token = await signUserToken(user[0])
		if (token) {
			return res.status(200).json({
				auth: true,
				username: user[0].username,
				user_id: user[0].user_id,
				token
			})
		}
	}
	catch (error) {
		let errorMessage
		if (error instanceof Error)
			errorMessage = error.message
		else
			errorMessage = 'Login failed. Unknown error.'
		return res.status(500).json({
				message: errorMessage
		})
	}
}

export const logout = async(req: Request, res: Response) => {

	try {
		const { user_id } = req.body

	} catch (error) {

	}
}
const getUserInformation = async(req: Request, res: Response) => {
	console.log('in getUserInformation', req.get('authorization'))
	return res.status(200).json({
		message: "Message",
		data: "empty"
	})
}

const deleteUser = async(req: Request, res: Response) => {
	console.log('in deleteUser', req.get('authorization'))
	return res.status(200).json({
		message: "Message",
		data: "empty"
	})
}

const updateUser = async(req: Request, res: Response) => {
	console.log('in updateUser', req.get('authorization'))
	return res.status(200).json({
		message: "Message",
		data: "empty"
	})
}

export default { register, login, getUserInformation, deleteUser, updateUser }