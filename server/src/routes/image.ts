import express, { Request, Response } from 'express';
import checkJWT from '../middleware/checkJWT';
import controller from '../controllers/image';
import { v4 as uuidv4 } from 'uuid';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { decodeUserFromAccesstoken } from '../controllers/token';

type DestinationCallback = (err: Error | null, destination: string) => void
type FilenameCallback = (err: Error | null, filename: string) => void

const checkFileValidity = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
	const validExtensions = /png|jpg|jpeg|gif|/;
	const validFileType = validExtensions.test(
		path?.extname(file.originalname).toLowerCase()
	);
	const validMimeType = validExtensions.test(file?.mimetype);
	if (!validFileType) return callback(null, false);
	if (!validMimeType) return callback(null, false);
	callback(null, true);
};

const diskStorage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, callback: DestinationCallback) => {
		callback(null, './images');
	},
	filename: (req: Request, file: Express.Multer.File, callback: FilenameCallback) => {
		const extension = file.mimetype.split('/')[1].toLowerCase();
		const filename = `${uuidv4().toString()}.${extension}`;
		callback(null, filename);
	},
});

// Multer initialization
const upload = multer({
	storage: diskStorage,
	fileFilter: checkFileValidity,
	limits: { fileSize: 10000000 },
});

const imageRouter: express.Router = express.Router();

imageRouter.get('/', (req: express.Request, res: express.Response) => {
	res.json({
		status: 400,
		message: 'Nothing here',
	});
});

imageRouter.post(
	'/',
	[checkJWT, upload.array('files')],
	async (req: Request, res: Response) => {
		try {
			// Get new filenames
			const filenames = (req.files as Express.Multer.File[]).map((file) => {
					return file.filename;
			});

			// Get user_id
			const user_id = await decodeUserFromAccesstoken(req);
			if (!user_id)
				return res.status(500).json({
					message: 'Cannot parse user_id',
				});
			// Save filenames to database
			const response = await controller.saveFilenames(
				user_id,
				filenames
			);
			if (!response)
				return res.status(500).json({
					message: 'Failed to save filenames to database',
				});
			// Send filenames as response
			return res.status(200).json({
				message: 'Files uploaded successfully',
				filenames: filenames,
			});
		} catch (err) {
			console.error(err);
			return res.status(500).json({
				message: 'Something went wrong',
			});
		}
	}
);
imageRouter.route('/:id').delete(checkJWT, controller.deleteImage);
imageRouter.get('/user/:id', checkJWT, controller.getUsersImages);

export default imageRouter;
