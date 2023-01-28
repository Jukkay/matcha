import jwt, { JwtPayload } from 'jsonwebtoken';
import { RowDataPacket } from 'mysql';
import { getRefreshToken, getServerToken } from './checkENV';

export const signEmailToken = async (email: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const expirationTime = 3600;
		jwt.sign(
			{
				email: email,
			},
			getServerToken(),
			{
				issuer: '42 Dates',
				algorithm: 'HS256',
				expiresIn: expirationTime,
			},
			(err, token) => {
				if (token) resolve(token);
				if (err) reject(err);
			}
		);
	});
};

export const verifyJWT = async (
	userToken: string,
	serverToken: string
): Promise<string | JwtPayload | undefined> => {
	return new Promise((resolve, reject) => {
		jwt.verify(userToken, serverToken, (err, decoded) => {
			if (err) {
				reject(err);
			} else resolve(decoded);
		});
	});
};

export const signAccessToken = async (
	user_id: RowDataPacket
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const expirationTime = '45m';
		jwt.sign(
			{
				user_id: user_id,
			},
			getServerToken(),
			{
				issuer: '42 Dates',
				algorithm: 'HS256',
				expiresIn: expirationTime,
			},
			(err, token) => {
				if (token) resolve(token);
				if (err) reject(err);
			}
		);
	});
};

export const signRefreshToken = async (
	user_id: RowDataPacket
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const expirationTime = '5 days';
		jwt.sign(
			{
				user_id: user_id,
			},
			getRefreshToken(),
			{
				issuer: '42 Dates',
				algorithm: 'HS256',
				expiresIn: expirationTime,
			},
			(err, token) => {
				if (token) resolve(token);
				if (err) reject(err);
			}
		);
	});
};
