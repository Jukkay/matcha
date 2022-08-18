const { RandomUser } = require('random-user-api');
import { createPool, Pool, RowDataPacket, PoolConnection } from 'mysql';
import params from '../src/config/mysql';
import * as SQLConnect from '../src/utilities/SQLConnect';

const reformatDate = (date: string) => {
	const dateObject = new Date(date);
    let days = dateObject.getDate()
    if (days > 28) days = 28
	return `${dateObject.getFullYear()}-${dateObject.getMonth()}-${days}`;
};

SQLConnect.init();
const randomUser = new RandomUser().format('json');
let userIDs = new Map();

const sql =
	'INSERT INTO users (username, password, email, name, birthday, validated, profile_exists) VALUES (?, ?, ?, ?, ?, "1", "1");';
const sql2 =
	'INSERT INTO profiles(user_id, country, city, gender, birthday, looking, min_age, max_age, introduction, interests, name, profile_image, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
const sql3 = 'SELECT user_id FROM users WHERE username = ?';
const hash = '$2a$10$FMUz0quSrsDNryT2TRvSJu7JavNK8iZPYKfF68K4408Y0jPBT/vpC';
const genderOptions = ['Male', 'Female'];

const createUsers = async (data: any) => {
	// Create users
	for (let key in data) {
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
		const result = await SQLConnect.execute(sql3, [
			data[key].login.username,
		]);
		userIDs.set(data[key].login.username, result[0]['user_id']);
	}
	console.log('User IDs fetched');
};

const createProfile = async (data: any) => {
	// Create profiles
	for (let key in data) {
		await SQLConnect.execute(sql2, [
			userIDs.get(data[key].login.username),
			data[key].nat,
			data[key].location.city,
			data[key].gender,
			reformatDate(data[key].dob.date),
			genderOptions[Math.floor(Math.random() * genderOptions.length)],
			data[key].dob.age - 5,
			data[key].dob.age + 5,
			'Random user introduction',
			'{"0":"Running","1":"Cycling","2":"Going to movies","3":"Yoga","4":"Cooking"}',
			data[key].name.first,
			data[key].gender == 'Male' ? 'male.jpg' : 'female.jpg',
			data[key].location.coordinates.latitude,
			data[key].location.coordinates.longitude,
		]);
	}
	console.log('Profiles created');
};

const main = async () => {
	try {
		const data = await randomUser
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
			.count(100)
			.retrieve()
			.then((res: any) => {
				return res;
			});
		console.log(data);
		await createUsers(data);
		await getUserIDs(data);
		await createProfile(data);
	} catch (err) {
		console.error(err);
	}
};
main();
