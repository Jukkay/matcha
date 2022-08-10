import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRouter from './routes/user';
import imageRouter from './routes/image';
import profileRouter from './routes/profile';
import { refreshToken, verifyEmailToken } from './controllers/token';
import { resetPassword } from './controllers/resetpassword';
import {
	sendNewEmailVerification,
	sendPasswordReset,
} from './controllers/mailer';
import * as SQLConnect from './utilities/SQLConnect';
import { getURL } from './utilities/getURL';
import { login, logout } from './controllers/user';

const app: express.Application = express();

// initialize db pool
SQLConnect.init();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/images', express.static('./images'));

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
	res.send('backend server is running');
});
app.post('/login', login);
app.post('/logout', logout);
app.post('/token', refreshToken);
app.post('/emailtoken', sendNewEmailVerification);
app.post('/resetpasswordtoken', sendPasswordReset);
app.post('/verifyemail', verifyEmailToken);
app.post('/setpassword', resetPassword);

// User CRUD route
app.use('/user', userRouter);

// User CRUD route
app.use('/profile', profileRouter);

// Image CRUD route
app.use('/image', imageRouter);

// Server start
app.listen(process.env.PORT, () => {
	console.log(`backend server running at ${getURL()}`);
});
