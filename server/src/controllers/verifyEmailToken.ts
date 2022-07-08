import { Request, Response} from 'express';
import { getSecret } from "docker-secret"
import jwt, { JwtPayload, VerifyErrors} from 'jsonwebtoken'
import IEmailToken from '../interfaces/token'

const server_token = getSecret("server_token")

const verifyEmailToken = async(req: Request, res: Response) => {
    const { token } = req.params

	if (!token) {
		return res.status(401).json({
			message: 'No token provided'
		})
	}
	jwt.verify(token, server_token, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				message: 'Cannot verify email token'
			})
		}
		res.locals.jwt = decoded
		const { email }  = decoded as IEmailToken
		const sql = `UPDATE users SET validated = "1" WHERE email = ${email};`

		return res.status(200).json({
			message: 'Email verified'
		})
	})

}

export default verifyEmailToken