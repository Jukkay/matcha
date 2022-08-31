const { RandomUser } = require('random-user-api');
import * as SQLConnect from '../utilities/SQLConnect';
import { dummyData } from './data';

const reformatDate = (date: string) => {
	const dateObject = new Date(date);
	let days = dateObject.getDate();
	if (days > 28) days = 28;
	return `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${days}`;
};

SQLConnect.init();
const randomUser = new RandomUser().format('json');
let userIDs = new Map();

const sql =
	'INSERT IGNORE INTO users (username, password, email, name, birthday, validated, profile_exists) VALUES (?, ?, ?, ?, ?, "1", "1");';
const sql2 =
	'INSERT IGNORE INTO profiles(user_id, country, city, gender, birthday, looking, min_age, max_age, introduction, interests, name, profile_image, latitude, longitude, famerating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
const sql3 = 'SELECT user_id FROM users WHERE username = ?';
const hash = '$2a$10$FMUz0quSrsDNryT2TRvSJu7JavNK8iZPYKfF68K4408Y0jPBT/vpC';
const genderOptions = ['Male', 'Female'];
const malePictureOptions = [
	'male.jpg',
	'male2.jpg',
	'male3.jpg',
	'male4.jpg',
	'male5.jpg',
	'male6.jpg',
	'male7.jpg',
	'male8.jpg',
	'male9.jpg',
	'male10.jpg',
];
const femalePictureOptions = [
	'female.jpg',
	'female2.jpg',
	'female3.jpg',
	'female4.jpg',
	'female5.jpg',
	'female6.jpg',
	'female7.jpg',
	'female8.jpg',
	'female9.jpg',
	'female10.jpg',
];

const removeDuplicates = (data: any) => {
	return data.filter((item: any, index: number) => {
		return (
			data.findIndex((item2: any) => {
				return (
					item2.email == item.email &&
					item2.login.username == item.login.username
				);
			}) == index
		);
	});
};

const createUsers = async (data: any) => {
	// Create users
	for (let key in data) {
		if (data[key].login.username)
			await SQLConnect.execute(sql, [
				data[key].login.username,
				hash,
				data[key].email,
				data[key].name.first,
				reformatDate(data[key].dob.date),
			]);
	}
	console.log('Users created');
};
const getUserIDs = async (data: any) => {
	// Get user_ids
	for (let key in data) {
		if (data[key].login.username) {
			const result = await SQLConnect.execute(sql3, [
				data[key].login.username,
			]);
			if (result[0] && result[0]['user_id']) {
				userIDs.set(data[key].login.username, result[0]['user_id']);
			}
		}
	}
	console.log('User IDs fetched');
};

const createProfile = async (data: any) => {
	// Create profiles
	let profile_image = '';
	for (let key in data) {
		let interests: string[] = [];
		for (let i = 0; i < 5; i++) {
			interests.push(dummyData[Math.floor(Math.random() * dummyData.length)]);
		}
		profile_image =
			data[key].gender == 'male'
				? malePictureOptions[
						Math.floor(Math.random() * malePictureOptions.length)
				  ]
				: femalePictureOptions[
						Math.floor(Math.random() * femalePictureOptions.length)
				  ];
		const user_id = userIDs.get(data[key].login.username);
		await SQLConnect.execute(sql2, [
			user_id,
			data[key].nat,
			data[key].location.city,
			data[key].gender[0].toUpperCase() +
				data[key].gender.slice(1).toLowerCase(),
			reformatDate(data[key].dob.date),
			genderOptions[Math.floor(Math.random() * genderOptions.length)],
			data[key].dob.age - 5,
			data[key].dob.age + 5,
			'Random user introduction',
			JSON.stringify(interests),
			data[key].name.first,
			profile_image,
			data[key].location.coordinates.latitude,
			data[key].location.coordinates.longitude,
			Math.floor(Math.random() * (1000 - 1) + 1),
		]);
		await SQLConnect.execute(
			'INSERT IGNORE INTO photos(user_id, filename) VALUES (?, ?)',
			[user_id, profile_image]
		);
		await SQLConnect.execute(
			'UPDATE profiles SET online=?, last_login=now() WHERE user_id = ?',
			[(Math.random() < 0.5), user_id]
		);
	}
	console.log('Profiles created');
};

const main = async () => {
	try {
		let data = await randomUser
			.excludeAllFieldsBut('name')
			.and()
			.excludeAllFieldsBut('dob')
			.and()
			.excludeAllFieldsBut('email')
			.and()
			.excludeAllFieldsBut('login')
			.and()
			.excludeAllFieldsBut('gender')
			.and()
			.excludeAllFieldsBut('location')
			.and()
			.excludeAllFieldsBut('nat')
			.nationality('fi')
			.count(2000)
			.retrieve()
			.then((res: any) => {
				return res;
			});
		let filtered = await removeDuplicates(data);
		await createUsers(filtered);
		await getUserIDs(filtered);
		await createProfile(filtered);
	} catch (err) {
		console.error(err);
	}
};
main();
