import { Request, Response } from 'express';
import { read } from 'fs';
import { OkPacket, RowDataPacket } from 'mysql';
import { execute } from '../utilities/SQLConnect';

const saveFilenames = async (user_id: string, filenames: string[]) => {
	if (filenames.length < 1) return;
	const sql = 'INSERT INTO photos(user_id, filename) VALUES (?, ?)';
	let photo_IDs = [];
	return (photo_IDs = await Promise.all(
		filenames.map(
			(filename) =>
				new Promise(async (resolve, reject) => {
					const response = await execute(sql, [user_id, filename]);
					if (!response) reject(response);
					resolve(await (<RowDataPacket>response).insertId);
				})
		)
	));
};

const deleteImage = async (req: Request, res: Response) => {
	console.log('in deleteImage', req.get('authorization'));
	return res.status(200).json({
		message: 'Message',
		data: 'empty',
	});
};

const getUsersImages = async (req: Request, res: Response) => {
	const user_id = req.params.id
	const sql = 'SELECT filename FROM photos WHERE user_id = ?';
	const photos = await execute(sql, [user_id]);
	return res.status(200).json({
		message: 'Photo filenames retrieved',
		photos: photos,
	});
};
export default { saveFilenames, deleteImage, getUsersImages };
