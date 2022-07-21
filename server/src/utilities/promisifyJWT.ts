import jwt, { JwtPayload } from 'jsonwebtoken'
import { getSecret } from "docker-secret"
import { RowDataPacket } from 'mysql'

export const signEmailToken = async(email: string): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = 3600
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

export const verifyJWT = async(userToken: string, serverToken: string): Promise<string | JwtPayload | undefined> => {
	return new Promise(async(resolve, reject) => {
		const server_token = getSecret("server_token")
		jwt.verify(userToken, serverToken, (err, decoded) => {
			if (err)
				reject(err)
			else resolve(decoded)
		})
	})
}

export const signAccessToken = async(user: RowDataPacket): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = 600
		jwt.sign({
				username: user.username,
				user_id: user.user_id
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

export const signRefreshToken = async(user: RowDataPacket): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = 6 * 60 * 60
		jwt.sign({
				username: user.username,
				user_id: user.user_id
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