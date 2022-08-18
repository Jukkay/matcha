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
	return `${bd.getFullYear()}-${bd.getMonth()}-${bd.getDate()}`;
};

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
		Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2) *
			Math.cos(lat1Radians) *
			Math.cos(lat2Radians)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = c * earthRadius
    return distance;
};
