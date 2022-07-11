import jwt, { JwtPayload } from 'jsonwebtoken'
import { getSecret } from "docker-secret"

export const signEmailToken = async(email: string): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = 600
		jwt.sign({
				email: email
			},
			getSecret("server_token"), {
				issuer: '42 Dates',
				algorithm: 'HS256',
				expiresIn: expirationTime
			}, (err, token) => {
				if (token)
					resolve(token)
				if (err)
					reject(err)
			})
	})
}

export const verifyJWT = async(token: string): Promise<string | JwtPayload | undefined> => {
	return new Promise(async(resolve, reject) => {
		const server_token = getSecret("server_token")
		jwt.verify(token, server_token, (err, decoded) => {
			if (err)
				reject(err)
			else resolve(decoded)
		})
	})
}

export const signUserToken = async(username: string): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = 600
		jwt.sign({
				username: username
			},
			getSecret("server_token"), {
				issuer: '42 Dates',
				algorithm: 'HS256',
				expiresIn: expirationTime
			}, (err, token) => {
				if (token)
					resolve(token)
				if (err)
					reject(err)
			})
	})
}