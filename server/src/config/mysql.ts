import { getSecret } from "docker-secret"

const params = {
	host: 'mariadb',
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	password: getSecret("mysql_password")
}
export default params