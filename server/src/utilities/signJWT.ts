import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { getSecret } from "docker-secret"

const signJWT = (user: string, callback: (error: Error | null, token: string | null) => void): void => {
	const expirationTime = 300
	try {
		jwt.sign({
			username: user
		},
		getSecret("server_token"), {
			issuer: 'Matcha',
			algorithm: 'HS256',
			expiresIn: 300
		},
		(error, token) => {
			if (error) {
				callback(error, null)
			}
			else if (token) {
				console.log('token in signJWT ' + token)
				callback(null, token)
			}
		})
	} catch (error: any) {
		console.log(error.message)
		callback(error, null)
	}
}

export default signJWT