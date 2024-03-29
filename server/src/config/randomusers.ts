const { RandomUser } = require('random-user-api');
import * as SQLConnect from '../utilities/SQLConnect';
import { dummyData } from './data';
import { location } from './gpsdata';
import { menFilenames, womenFilenames } from './filenames';

const reformatDate = (date: string) => {
    const dateObject = new Date(date);
    let days = dateObject.getDate();
    if (days > 28) days = 28;
    return `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${days}`;
};

SQLConnect.init();
const randomUser = new RandomUser().format('json');
const userIDs = new Map();

const sql = `
    INSERT IGNORE INTO 
        users 
        (
            username, 
            password, 
            email, 
            name, 
            birthday, 
            validated, 
            profile_exists
        ) 
    VALUES (?, ?, ?, ?, ?, "1", "1");`;
const sql2 = `
    INSERT IGNORE INTO 
        profiles
        (
            user_id, 
            country, 
            city, 
            gender, 
            birthday, 
            looking, 
            min_age, 
            max_age, 
            introduction, 
            interests, 
            name, 
            profile_image, 
            latitude, 
            longitude, 
            famerating
        ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const sql3 = `
    SELECT 
        user_id 
    FROM 
        users 
    WHERE 
        username = ?`;
const hash = '$2a$10$FMUz0quSrsDNryT2TRvSJu7JavNK8iZPYKfF68K4408Y0jPBT/vpC';
const genderOptions = ['Male', 'Female'];

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
    for (const key in data) {
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
    for (const key in data) {
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
    for (const key in data) {
        const interests: string[] = [];
        for (let i = 0; i < 5; i++) {
            interests.push(
                dummyData[Math.floor(Math.random() * dummyData.length)]
            );
        }
        const user_id = userIDs.get(data[key].login.username);
        if (!user_id) continue
        const filenames: string[][] = [];
        for (let i = 0; i < 5; i++) {
            const filename =
                data[key].gender == 'male'
                    ? menFilenames[
                            Math.floor(
                                Math.random() * menFilenames.length
                            )
                      ]
                    : womenFilenames[
                            Math.floor(
                                Math.random() * womenFilenames.length
                            )
                      ];
            const temp = [user_id, filename];
            filenames.push(temp);
        }
        profile_image = filenames[0][1];
        const locationIndex = Math.floor(Math.random() * location.length);
        await SQLConnect.execute(sql2, [
            user_id,
            data[key].nat,
            location[locationIndex].Name,
            data[key].gender[0].toUpperCase() +
                data[key].gender.slice(1).toLowerCase(),
            reformatDate(data[key].dob.date),
            genderOptions[Math.floor(Math.random() * genderOptions.length)],
            data[key].dob.age - 5,
            data[key].dob.age + 5,
            `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            JSON.stringify(interests),
            data[key].name.first,
            profile_image,
            location[locationIndex].Latitude,
            location[locationIndex].Longitude,
            Math.floor(Math.random() * (1000 - 1) + 1),
        ]);
        await SQLConnect.execute(
            'INSERT IGNORE INTO photos(user_id, filename) VALUES ?',
            [filenames]
        );
        await SQLConnect.execute(
            'UPDATE profiles SET last_login=now() WHERE user_id = ?',
            [user_id]
        );
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
            .excludeAllFieldsBut('nat')
            .nationality('fi')
            .count(5000)
            .retrieve()
            .then((res: any) => {
                return res;
            });
        const filtered = await removeDuplicates(data);
        await createUsers(filtered);
        await getUserIDs(filtered);
        await createProfile(filtered);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
main();
