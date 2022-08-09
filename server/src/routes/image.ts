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
		console.log(file);
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
			controller.saveFilenames(user_id, filenames);

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
imageRouter
	.route('/:id')
	.get(checkJWT, controller.getImage)
	.delete(checkJWT, controller.deleteImage);

export default imageRouter;
