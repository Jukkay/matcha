import express from 'express';
import checkJWT from '../middleware/checkJWT';
import {
	logVisitor,
	getVisitorLog,
	getRecentProfiles,
} from '../controllers/log';

const logRouter: express.Router = express.Router();

logRouter.post('/', checkJWT, logVisitor);
logRouter.get('/', checkJWT, getRecentProfiles);

logRouter.route('/:id').get(checkJWT, getVisitorLog);

export default logRouter;
