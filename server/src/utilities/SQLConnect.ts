import { createPool, Pool, RowDataPacket } from 'mysql';
import params from '../config/mysql';

let pool: Pool;

export const init = () => {
	try {
		pool = createPool(params);
		console.log('Mysql connection pool created successfully');
	} catch (err) {
		console.error('Mysql pool init failed ' + err);
	}
};

export const execute = async (
	query: string,
	queryParams: Array<any>
): Promise<RowDataPacket[]> =>
	new Promise((resolve, reject) => {
		if (!pool) throw new Error('No connection pool available');
		pool.query<RowDataPacket[]>(query, queryParams, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});

export const query = async (query: string): Promise<RowDataPacket[]> =>
	new Promise((resolve, reject) => {
		if (!pool) throw new Error('No connection pool available');
		pool.query<RowDataPacket[]>(query, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
