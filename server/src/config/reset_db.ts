import mysql from 'mysql';
import { getSecret } from "docker-secret"
import { readFile } from 'fs';
import { promisify } from 'util';

const user = process.env.MYSQL_USER
const database = process.env.MYSQL_DATABASE
const password = getSecret("mysql_password")
const readFilePromise = promisify(readFile)

const reset_db = async () => {

	try {
		const db = mysql.createConnection({
			host: 'mariadb',
			user: user,
			password: password,
			database: database,
		})

		const reset = await readFilePromise('/server/config/reset.sql', 'utf8')
		const reset_queries = reset.split(';').map(element => element.trim()).filter(element => element !== '')
		reset_queries.forEach((sql) =>
			db.query(sql)
		)

		const init = await readFilePromise('/server/config/init.sql', 'utf8')
		const init_queries = init.split(';').map(element => element.trim()).filter(element => element !== '')
		init_queries.forEach((sql) =>
			db.query(sql)
		)
		db.end()
		process.exit(0)
	} catch (err) {
		console.error(err)
		process.exit(1)
	}
}

reset_db()
