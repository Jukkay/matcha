import express from 'express';
import checkJWT from '../middleware/checkJWT'
import controller from '../controllers/profile'

const profileRouter: express.Router = express.Router();

profileRouter.post('/', controller.newProfile)
profileRouter.patch('/', checkJWT, controller.updateProfile)
// userRouter.get('/images', controller.getUserImageIDs)
profileRouter
	.route('/:id')
	.get(checkJWT, controller.getProfile)
	.delete(checkJWT, controller.deleteProfile)

export default profileRouter