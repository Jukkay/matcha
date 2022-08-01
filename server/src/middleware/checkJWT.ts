import { Request, Response, NextFunction} from 'express';
import { getSecret } from "docker-secret"
import jwt from 'jsonwebtoken'

const server_token = getSecret("server_token")

const checkJWT = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1]
	if (!token) {
		return res.status(401).json({
			message: 'No token provided'
		})
	}
	jwt.verify(token, server_token, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				message: 'Unauthorized'
			})
		}
		next()
	})

}

export default checkJWT