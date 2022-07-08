import { NextFunction, Request, Response } from "express";
import { getSecret } from "docker-secret"
import mysql, { RowDataPacket }from 'mysql';
import jwt from 'jsonwebtoken'
import bcryptjs from "bcryptjs";
import params from "../config/mysql";
import signJWT from "../utilities/signJWT";
import sendEmailVerification from "../utilities/sendEmailVerification";

const db: mysql.Connection = mysql.createConnection(params)

const register = (req: Request, res: Response, next: NextFunction) => {
	const { username, password, name, email } = req.body

	bcryptjs.hash(password, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({
				error: err,
				message: err.message
			})
		}
		const sql = `INSERT INTO users (name, username, password, email) VALUES ("${name}", "${username}", "${hash}", "${email}");`
		db.query(sql, (queryErr, result) => {
			console.log(result)
			if (queryErr) {
				return res.status(500).json({
					error: queryErr,
					message: queryErr.message
				})
			}
			return res.status(201).json({
				message: 'User added successfully'
			})
		})
		db.end();
	})

	const email_token: string = jwt.sign(
		{email},
		getSecret("server_token"), {
		issuer: 'Matcha',
		algorithm: 'HS256',
		expiresIn: 360
	})
	sendEmailVerification(req.body.email, email_token)
}

const login = (req: Request, res: Response, next: NextFunction) => {
	// create token here
	const { username, password } = req.body
	const sql: string = `SELECT * FROM users WHERE username = "${username}";`
	db.query(sql, (err: Error, result: RowDataPacket[]) => {
		if (err) {
			console.log(err)
			return;
		}
		if (!result) {
			return res.json({
				status: 400,
				auth: false,
				message: 'Invalid user'
			})
		}
		bcryptjs.compare(password, result[0].password, (err, response) => {
			if (err) {
				return res.json({
					status: 400,
					auth: false,
					message: 'Invalid password'
				})
			}
			if (response) {
				signJWT(result[0].username, (error, token) => {
					if (error) {
						return res.json({
							status: 400,
							auth: false,
							message: error.message
						})
					}
					if (token) {
						return res.json({
							status: 200,
							auth: true,
							token,
							user: result[0].username,
							user_id: result[0].user_id
						})
					}

				})
			}
		})
	})

}

const getUserInformation = (req: Request, res: Response, next: NextFunction) => {
}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
}

const updateUser = (req: Request, res: Response, next: NextFunction) => {
}

export default { register, login, getUserInformation, deleteUser, updateUser }