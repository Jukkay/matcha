import express from 'express';
import checkJWT from '../middleware/checkJWT'
import controller from '../controllers/image'
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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