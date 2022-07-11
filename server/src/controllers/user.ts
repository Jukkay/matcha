import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { getSecret } from "docker-secret"
import { execute } from '../utilities/SQLConnect';
import jwt from 'jsonwebtoken'
import bcryptjs from "bcryptjs";
import { IUser } from "../interfaces/IUser";
import { signJWTemail } from "../utilities/promisifyJWT";
import { sendEmailVerification } from "../utilities/sendEmailVerification";

const register = async(req: Request, res: Response) => {
	const { username, password, name, email } = req.body
	try {
		const hash = await bcryptjs.hash(password, 10)
		const sql = `INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?);`
		const result = await execute(sql, [username, password, email, name])
		const email_token = await signJWTemail(email)
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

const login = async(req: Request, res: Response, next: NextFunction) => {

	const { username, password } = req.body
	try {
		const sql = `SELECT * FROM users WHERE username = ?;`
		const user = await execute(sql, username)
		if (!user) {
			return res.status(400).json({
				auth: false,
				message: 'Invalid user'
			})
		}

		const match = await bcryptjs.compare(password, user[0].password)
		if (!match) {
			return res.status(400).json({
				auth: false,
				message: 'Invalid password'
			})
		}

		const token = await signJWTemail(user[0].username)
		if (token) {
			return res.json({
				status: 200,
				auth: true,
				token,
				user: user[0].username,
				user_id: user[0].user_id
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

const getUserInformation = (req: Request, res: Response, next: NextFunction) => {
}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
}

const updateUser = (req: Request, res: Response, next: NextFunction) => {
}

export default { register, login, getUserInformation, deleteUser, updateUser }