import { getSecret } from "docker-secret"
import { PoolOptions } from "mysql"

const params: PoolOptions = {
	host: process.env.MYSQL_HOST || "localhost",
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT),
	password: getSecret("mysql_password")
}
export default params