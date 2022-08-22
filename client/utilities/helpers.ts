import { IResultsProfile } from '../types/types';

export const convertBirthdayToAge = (birthday: string) => {
	const now = new Date().getTime();
	const bd = new Date(birthday).getTime();
	const age = (now - bd) / (1000 * 60 * 60 * 24) / 365;
	return Math.floor(age);
};

export const convertAgeToBirthday = (age: number) => {
	const now = new Date().getTime();
	const ageInMilliseconds = age * 31556952000 + 364 * 86400000;
	const bd = new Date(now - ageInMilliseconds);
	return `${bd.getFullYear()}-${bd.getMonth() + 1}-${bd.getDate()}`;
};


// export const calculateTimeSinceMatching = (timestamp: string) => {
// 	const now = new Date().getTime();
// 	const before = new Date(timestamp).getTime()
// 	const timeElapsed = new Date(now - before);
// 	return `Matched ${timeElapsed.getFullYear()} years, ${timeElapsed.getMonth() + 1} months and${timeElapsed.getDate()} days ago`;
// }

export const reformatDate = (date: string) => {
    const dateObject = new Date(date)
    return `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${dateObject.getDate()}`
}

export const distanceBetweenPoints = (
	latitude1: string,
	longitude1: string,
	latitude2: string,
	longitude2: string
) => {
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
	const distance = Math.floor(c * earthRadius / 1000);
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
			profile.latitude as string,
			profile.longitude as string
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
		common_tags: countCommonTags(JSON.parse(profile.interests), ownTags)
	}));
	return resultsWithCommonTags;
};

export const countCommonTags = (profileTags: {}, ownTags: {}) => {
	const count = Object.values(profileTags).filter((tag) => Object.values(ownTags).includes(tag)).length
	return count
}