import { Request, Response, NextFunction} from 'express';
import { getSecret } from "docker-secret"
import jwt from 'jsonwebtoken'

const server_token = getSecret("server_token")

const checkSocketJWT = (token: string) => {
	try {
		if (!token) {
			return false
        }
		jwt.verify(token, server_token, (err) => {
			if (err) {
				return false
			}
			return true
		})
	} catch (err) {
		return false
	}

}

export default checkSocketJWT