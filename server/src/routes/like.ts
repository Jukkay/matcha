import express from 'express';
import checkJWT from '../middleware/checkJWT'
import controller from '../controllers/like'

const likeRouter: express.Router = express.Router();

likeRouter.post('/', controller.addNewLike)
// userRouter.get('/images', controller.getUserImageIDs)
likeRouter
	.route('/:id')
	.get(checkJWT, controller.getLikerProfiles)
	.delete(checkJWT, controller.removeLike)

export default likeRouter