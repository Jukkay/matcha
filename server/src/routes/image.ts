import express from 'express';
import checkJWT from '../middleware/checkJWT';
import controller from '../controllers/image';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { decodeUserFromAccesstoken } from '../controllers/token';

const checkFileValidity = (req: any, file: any, callback: any) => {
	const validExtensions = /png|jpg|jpeg|gif|/;
	const validFileType = validExtensions.test(
		path?.extname(file.originalname).toLowerCase()
	);
	const validMimeType = validExtensions.test(file?.mimeType);
	if (!validFileType) return callback('Invalid file extension', false);
	if (!validMimeType) return callback('Invalid Mime type', false);
	callback(null, true);
};

const diskStorage = multer.diskStorage({
	destination: (req: any, file: any, callback: any) => {
		callback(null, './images');
	},
	filename: (req: any, file: any, callback: any) => {
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
	async (req: any, res: any) => {
		try {
			// Get new filenames
			let filenames: string[] = [];
			req.files.map((file: any) => {
				filenames.push(file.filename);
			});

			// Get user_id
			const user_id = await decodeUserFromAccesstoken(req);
			if (!user_id)
				return res.status(500).json({
					message: 'Cannot parse user_id',
				});
			// Save filenames to database
			const photo_IDs = await controller.saveFilenames(
				user_id,
				filenames
			);
			if (!photo_IDs)
				return res.status(500).json({
					message: 'Failed to save filenames to database',
				});
			// Send filenames as response
			return res.status(200).json({
				message: 'Files uploaded successfully',
				filenames: filenames,
			});
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				message: 'Something went wrong',
			});
		}
	}
);
imageRouter.route('/:id').delete(checkJWT, controller.deleteImage);
imageRouter.get('/user/:id', checkJWT, controller.getUsersImages);

export default imageRouter;
