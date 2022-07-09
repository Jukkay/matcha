import { createPool, Pool, RowDataPacket } from 'mysql'
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

export const execute = async (query: string, queryParams: string[] | Object): Promise<RowDataPacket[]> => new Promise((resolve, reject) => {
	try {
		if (!pool)
			throw new Error('No connection pool available')
		pool.query<RowDataPacket[]>(query, queryParams, (err, result) => {
			if (err)
				reject(err)
			else
				resolve(result)
		})
	} catch (err) {
		console.error(err)
		throw new Error('Mysql query failed')
	}
})
