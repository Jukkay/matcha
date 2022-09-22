import { Request, Response, NextFunction} from 'express';
import { getSecret } from "docker-secret"
import jwt from 'jsonwebtoken'

const server_token = getSecret("server_token")

const checkJWT = (req: Request, res: Response, next: NextFunction) => {
	try {

		const token = req.headers.authorization?.split(' ')[1]
		if (!token) {
			return res.status(401).json({
				message: 'No token provided'
			})
		}
		jwt.verify(token, server_token, (err) => {
			if (err) {
				return res.status(401).json({
					message: 'Unauthorized'
				})
			}
			next()
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({
			message: 'Cannot verify token'
		})
	}

}

export default checkJWT