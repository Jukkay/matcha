import express from 'express';
const userRouter = express.Router();

userRouter.get('/', (req: express.Request, res: express.Response) => {
	res.json({
		status: 400,
		message: 'Nothing here'
	})
})

userRouter.post('/', (req: express.Request, res: express.Response) => {
	// receive, validate and save user data
	res.json({
		status: 201,
		message: 'User added successfully'
	})
})
userRouter
	.route('/:id')
	.get((req: express.Request, res: express.Response) => {
		res.json({
			status: 200,
			message: 'User information',
			data: req.body
		})
	})
	.patch((req: express.Request, res: express.Response) => {
		// receive, validate and update user data
		res.json({
			status: 200,
			message: 'User information modified successfully'
		})
	})
	.delete((req: express.Request, res: express.Response) => {
		// Find user by id and delete
		res.json({
			status: 200,
			message: 'User deleted successfully'
		})
	})

export default userRouter