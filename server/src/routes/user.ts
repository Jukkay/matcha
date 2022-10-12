import express from 'express';
import checkJWT from '../middleware/checkJWT';
import controller from '../controllers/user';

const userRouter: express.Router = express.Router();

userRouter.post('/', controller.register);
userRouter.patch('/', checkJWT, controller.updateUser);
// userRouter.get('/images', controller.getUserImageIDs)
userRouter
	.route('/:id')
	.get(checkJWT, controller.getUserInformation)
	.delete(checkJWT, controller.deleteUser);

export default userRouter;
