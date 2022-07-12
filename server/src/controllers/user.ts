import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { getSecret } from "docker-secret"
import { execute } from '../utilities/SQLConnect';
import jwt from 'jsonwebtoken'
import bcryptjs from "bcryptjs";
import { IUser } from "../interfaces/IUser";
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
		console.error(error)
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
		const sql = `SELECT user_id, username, password, validated FROM users WHERE username = ?;`
		const user = await execute(sql, username)
		if (!user) {
			return res.status(400).json({
				auth: false,
				message: 'Invalid user'
			})
		}
		if (user[0].validated != true) {
			return res.status(400).json({
				auth: false,
				message: 'Email not validated'
			})
		}
		const match = await bcryptjs.compare(password, user[0].password)
		if (!match) {
			return res.status(400).json({
				auth: false,
				message: 'Invalid password'
			})
		}
		const token = await signUserToken(user[0].username)
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
		console.error(error)
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
const getUserInformation = (req: Request, res: Response, next: NextFunction) => {
}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
}

const updateUser = (req: Request, res: Response, next: NextFunction) => {
}

export default { register, login, getUserInformation, deleteUser, updateUser }