import mysql, { QueryOptions } from 'mysql';
import { getSecret } from 'docker-secret';
import { readFile } from 'fs';
import { promisify } from 'util';

const user = process.env.MYSQL_USER;
const database = process.env.MYSQL_DATABASE;
const password = getSecret('mysql_password');
const db = mysql.createConnection({
	host: 'mariadb',
	user: user,
	password: password,
	database: database,
	multipleStatements: true
});
const query = promisify(db.query).bind(db);
(async() => {
	try {
		
		readFile('/server/config/reset.sql', 'utf8', async(err, data) => {
			if (err) throw err;
			if (data) {
				const reset = await data
				await query(data)

			}
		})
		// const reset_queries = reset
		// 	.split(';')
		// 	.map((element) => element.trim())
		// 	.filter((element) => element !== '');
		// reset_queries.forEach((sql) => {
		// 	sql += ';'
		// 	db.query(sql);
		// });

		const init = await readFilePromise('/server/config/init.sql', 'utf8').toString();
		db.query(init, (err, result) => {
			if (err) throw err;
			else console.log(result)
		})
		// const init_queries = init
		// 	.split(';')
		// 	.map((element) => element.trim())
		// 	.filter((element) => element !== '');
		// init_queries.forEach((sql) => {
		// 	sql += ';'
		// 	console.log(sql);
		// 	db.query(sql);
		// });
		db.end();
		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();
