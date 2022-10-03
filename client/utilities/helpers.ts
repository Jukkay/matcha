import { IResultsProfile } from '../types/types';

export const convertBirthdayToAge = (birthday: string) => {
	const now = new Date().getTime();
	const bd = new Date(birthday).getTime();
	const age = (now - bd) / (1000 * 60 * 60 * 24) / 365;
	return Math.floor(age);
};

export const reformatDateTime = (datetime: string) => {
	const dateObject = new Date(datetime);
	return `${dateObject.getFullYear()}-${
		dateObject.getMonth() + 1
	}-${dateObject.getDate()} ${dateObject.toLocaleTimeString()}`;
};
export const distanceBetweenPoints = (
	latitude1: string,
	longitude1: string,
	latitude2: string,
	longitude2: string
) => {
	if (!latitude1 || !longitude1 || !latitude2 || !longitude2) return 0;
	const lat1 = parseFloat(latitude1);
	const lat2 = parseFloat(latitude2);
	const lon1 = parseFloat(longitude1);
	const lon2 = parseFloat(longitude2);
	const earthRadius = 6371;
	const latDistance = ((lat2 - lat1) * Math.PI) / 180;
	const lonDistance = ((lon2 - lon1) * Math.PI) / 180;
	const lat1Radians = (lat1 * Math.PI) / 180;
	const lat2Radians = (lat2 * Math.PI) / 180;

	const a =
		Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
		Math.sin(lonDistance / 2) *
			Math.sin(lonDistance / 2) *
			Math.cos(lat1Radians) *
			Math.cos(lat2Radians);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = Math.floor(c * earthRadius);
	return distance;
};

export const addDistanceToProfiles = (
	results: IResultsProfile[],
	latitude: string,
	longitude: string
) => {
	const resultsWithDistance = results.map((profile) => ({
		...profile,
		distance: distanceBetweenPoints(
			latitude,
			longitude,
			profile.user_latitude ? profile.user_latitude : profile.latitude,
			profile.user_longitude ? profile.user_longitude : profile.longitude
		),
	}));
	return resultsWithDistance;
};

export const addCommonTagsToProfiles = (
	results: IResultsProfile[],
	ownTags: {}
) => {
	const resultsWithCommonTags = results.map((profile) => ({
		...profile,
		common_tags: countCommonTags(JSON.parse(profile.interests), ownTags),
	}));
	return resultsWithCommonTags;
};

export const countCommonTags = (profileTags: {}, ownTags: {}) => {
	const count = Object.values(profileTags).filter((tag) =>
		Object.values(ownTags).includes(tag)
	).length;
	return count;
};

export const createSQLDatetimeString = () => {
	return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

export const handleRouteError = (err: any, url: any) => {
	if (err.cancelled) {
		console.log(`Route to ${url} was cancelled!`);
	}
};
