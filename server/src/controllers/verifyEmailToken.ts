import { Request, Response} from 'express';
import { getSecret } from "docker-secret"
import IEmailToken from '../interfaces/token'
import { execute } from '../utilities/SQLConnect';
import { verifyJWT } from '../utilities/promisifyJWT';

const server_token = getSecret("server_token")

export const verifyEmailToken = async(req: Request, res: Response) => {
	try {
		const { token } = req.params
		if (!token) {
			return res.status(401).json({
				message: 'No token provided'
			})
		}
		const decoded = await verifyJWT(token)
		const { email }  = decoded as IEmailToken
		console.log(decoded)
		console.log(email)
		const sql = `UPDATE users SET validated = "1" WHERE email = ?;`
		const response = await execute(sql, [email])
		console.log(response)
		return res.status(201).json({
			message: 'Email verified'
		})

	} catch (err) {
		return res.status(401).json({
			message: 'Cannot verify email token'
		})
	}
}