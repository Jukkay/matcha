import { createPool, Pool, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql'
import params from "../config/mysql"

let pool: Pool

export const init = () => {
	try {
		pool = createPool(params)
		console.log("Mysql connection pool created successfully")
	} catch (err) {
		console.error('Mysql pool init failed ' + err)
	}
}

export const execute = <T>(query: string, queryParams: string[] | Object): Promise<T> | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader => {
	try {
		if (!pool)
			throw new Error('No connection pool available')
		return new Promise<T>((resolve, reject) => {
			pool.query(query, queryParams, (err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	} catch (err) {
		console.error(err)
		throw new Error('Mysql query failed')
	}
}
