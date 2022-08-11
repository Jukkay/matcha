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
		jwt.verify(userToken, serverToken, (err, decoded) => {
			if (err) {
				reject(err)
			}
			else resolve(decoded)
		})
	})
}

export const signAccessToken = async(user_id: RowDataPacket): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = '5m'
		jwt.sign({
				user_id: user_id
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

export const signRefreshToken = async(user_id: RowDataPacket): Promise<string> => {
	return new Promise(async(resolve, reject) => {
		const expirationTime = '5 days'
		jwt.sign({
				user_id: user_id
			},
			getSecret("refresh_token"), {
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