import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';

const saveFilenames = async (user_id: string, filenames: string[]) => {
	if (filenames.length < 1) return;
  const sql = 'INSERT INTO photos(user_id, filename) VALUES (?, ?)'
  filenames.forEach(filename => execute(sql, [user_id, filename]))

};

const getImage = async (req: Request, res: Response) => {
	console.log('in getImage', req.get('authorization'));
	return res.status(200).json({
		message: 'Message',
		data: 'empty',
	});
};

const deleteImage = async (req: Request, res: Response) => {
	console.log('in deleteImage', req.get('authorization'));
	return res.status(200).json({
		message: 'Message',
		data: 'empty',
	});
};

export default { saveFilenames, getImage, deleteImage };
