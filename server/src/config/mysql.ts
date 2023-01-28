import { PoolOptions } from "mysql"
import { getMySQLConnectionLimit, getMySQLDatabase, getMySQLHost, getMySQLPassword, getMySQLUser } from "../utilities/checkENV"

const params: PoolOptions = {
	host: getMySQLHost(),
	database: getMySQLDatabase(),
	user: getMySQLUser(),
	connectionLimit: getMySQLConnectionLimit(),
	password: getMySQLPassword(),
}
export default params
