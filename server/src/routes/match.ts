import express from 'express';
import checkJWT from '../middleware/checkJWT';
import controller from '../controllers/match';

const matchRouter: express.Router = express.Router();

matchRouter
	.route('/:id')
	.get(checkJWT, controller.getAllMatches)

export default matchRouter;
