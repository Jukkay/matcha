import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { getSecret } from "docker-secret"
import { rejects } from 'assert'

const signJWT = async(user: string) => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = 300
		try {
			jwt.sign({
					username: user
				},
				getSecret("server_token"), {
					issuer: 'Matcha',
					algorithm: 'HS256',
					expiresIn: expirationTime
				}, (err, token) => {
					if (token) {
						console.log('token in signJWT ' + token)
						resolve(token)
					}
					if (err)
						throw new Error("Token signature failed")
				})
		} catch (error: any) {
			console.log(error.message)
			reject(error)
		}

	})
}

export default signJWT