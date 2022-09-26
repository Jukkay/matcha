import geoip from 'fast-geoip';
import requestIP from 'request-ip';
import { Request } from 'express';

export const convertBirthdayToAge = (birthday: string) => {
	const now = new Date().getTime();
	const bd = new Date(birthday).getTime();
	const age = (now - bd) / (1000 * 60 * 60 * 24) / 365;
	return Math.floor(age);
};

export const reformatDate = (date: string) => {
	const dateObject = new Date(date);
	return `${dateObject.getFullYear()}-${
		dateObject.getMonth() + 1
	}-${dateObject.getDate()}`;
};

export const convertAgeToBirthday = (age: number) => {
	const now = new Date().getTime();
	const ageInMilliseconds = age * 31556952000;
	const bd = new Date(now - ageInMilliseconds);
	return `${bd.getFullYear()}-${bd.getMonth() + 1}-${bd.getDate()}`;
};

export const convertMIN_AGE = (age: number) => {
	const now = new Date().getTime();
	const ageInMilliseconds = age * 31556952000;
	const bd = new Date(now - ageInMilliseconds);
	return `${bd.getFullYear()}-${bd.getMonth() + 1}-${bd.getDate()}`;
};

export const convertMAX_AGE = (age: number) => {
	const now = new Date().getTime();
	const ageInMilliseconds = age * 31556952000 + 364 * 86400000;
	const bd = new Date(now - ageInMilliseconds);
	return `${bd.getFullYear()}-${bd.getMonth() + 1}-${bd.getDate()}`;
};

export const locateIP = async (user_id: string, req: Request) => {
	// Get and locate IP
	const ip = requestIP.getClientIp(req) || '127.0.0.1';
	const ip_location = await geoip.lookup(ip);
	return ip_location;
};
