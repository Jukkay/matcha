import mysql from 'mysql';
import { getSecret } from "docker-secret"
import fs from 'fs';

const user = process.env.MYSQL_USER
const database = process.env.MYSQL_DATABASE
const password = getSecret("mysql_password")

try {
	const db = mysql.createConnection({
		host: 'mariadb',
		user: user,
		password: password,
		database: database,
	})
	const reset = fs.readFileSync('config/reset.sql').toString().split(';').map(element => element.trim()).filter(element => element !== '')
	reset.forEach((sql) =>
		db.query(sql)
	)

	const init = fs.readFileSync('config/init.sql').toString().split(';').map(element => element.trim()).filter(element => element !== '')
	init.forEach((sql) =>
		db.query(sql)
	)

} catch (err) {
	console.error(err)
}