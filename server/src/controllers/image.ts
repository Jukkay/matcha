import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import { unlink } from 'fs';
import { decodeUserFromAccesstoken } from './token';

const saveFilenames = async (user_id: string, filenames: string[]) => {
	// user_id was decoded from accesstoken on calling function
	if (filenames.length < 1 || !user_id) return;
	
	const sql = `
		INSERT INTO 
			photos
			(
				user_id, 
				filename
			) 
		VALUES (?, ?)`;
	const response = await Promise.all(
		filenames.map(
			(filename) =>
				Promise.resolve(execute(sql, [user_id, filename]))
		)
	).catch(error => console.error(error))
	return response
};

const deleteImage = async (req: Request, res: Response) => {
	const image = req.params.id;
	if (!image) return res.status(400).json({ message: 'No image specified' });
	const sql = `
		DELETE FROM 
			photos 
		WHERE 
			filename = ? 
			AND 
			user_id = ?`;
	try {
		// Get user_id
		const user_id = await decodeUserFromAccesstoken(req);
		if (!user_id)
			return res.status(500).json({
				message: 'Cannot parse user_id',
			});
		// Delete from database
		await execute(sql, [image, user_id]);

		// Delete file from server
		unlink(`./images/${image}`, (err) => {
			if (err) {
				console.error(err);
				return res.status(400).json({ message: 'No image found' });
			}
			return res.status(200).json({
				message: 'Image deleted',
			});
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Something went wrong' });
	}
};

const getUsersImages = async (req: Request, res: Response) => {
	const sql = `
		SELECT 
			filename 
		FROM 
			photos 
		WHERE 
			user_id = ?`;
	try {
		// Get user_id
		const user_id = req.params.id;
		const photos = await execute(sql, [user_id]);
		return res.status(200).json({
			message: 'Photo filenames retrieved',
			photos: photos,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Something went wrong' });
	}
};
export default { saveFilenames, deleteImage, getUsersImages };
