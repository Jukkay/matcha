import express from 'express';
import checkJWT from '../middleware/checkJWT'
import controller from '../controllers/image'
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path'

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
		console.log(file)
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
		message: 'Nothing here'
	})
})

imageRouter.post('/', checkJWT, upload.array('files'), controller.upload)
imageRouter
	.route('/:id')
	.get(checkJWT, controller.getImage)
	.delete(checkJWT, controller.deleteImage)

export default imageRouter