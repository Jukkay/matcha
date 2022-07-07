import { Request, Response, NextFunction} from 'express';
import { getSecret } from "docker-secret"
import jwt from 'jsonwebtoken'

const server_token = getSecret("server_token")

const checkJWT = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1]

	if (!token) {
		return res.json({
			status: 401,
			message: 'Unauthorized'
		})
	}
	jwt.verify(token, server_token, (err, decoded) => {
		if (err) {
			return res.json({
				status: 401,
				message: 'Unauthorized'
			})
		}
		res.locals.jwt = decoded
		next()
	})

}

export default checkJWT