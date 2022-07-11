import { Request, Response, NextFunction} from 'express';
import { getSecret } from "docker-secret"
import IEmailToken from '../interfaces/token'
import { execute } from '../utilities/SQLConnect';
import { verifyJWT } from '../utilities/promisifyJWT';


export const verifyEmailToken = async(req: Request, res: Response) => {
	try {
		const { token } = req.params
		const server_token = getSecret("server_token")
		if (!token) {
			return res.status(401).json({
				message: 'No token provided'
			})
		}
		const decoded = await verifyJWT(token, server_token)
		const { email }  = decoded as IEmailToken
		const sql = `UPDATE users SET validated = "1" WHERE email = ?;`
		const response = await execute(sql, [email])
		return res.status(201).json({
			message: 'Email verified'
		})

	} catch (err) {
		return res.status(401).json({
			message: 'Cannot verify email token'
		})
	}
}

export const refreshToken = async(req: Request, res: Response, next: NextFunction) => {
	try {

		const { token } = req.body
		const refresh_token = getSecret("refresh_token")
		if (!token) {
			return res.json({
				status: 401,
				message: 'No token given'
			})
		}
		// If given token doesn't match a token in refresh token table, status 403. Else
		const decoded = await verifyJWT(token, refresh_token)
		// create and return new access token

		next()
	} catch (err) {
		console.error(err)
		return res.status(403).json({
			message: 'Unauthorized'
		})
	}

}