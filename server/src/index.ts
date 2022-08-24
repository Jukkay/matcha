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
import likeRouter from './routes/like';
import checkJWT from './middleware/checkJWT';
import { searchProfiles } from './controllers/search';
import { logVisitor } from './controllers/log';
import logRouter from './routes/log';
import matchRouter from './routes/match';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { getChatMessages, saveMessageToDatabase } from './controllers/chat';
import { wrap } from './utilities/helpers'

const app: express.Application = express();

// initialize db pool
SQLConnect.init();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/images', express.static('./images'));

// Server start
const httpServer = app.listen(process.env.PORT, () => {
	console.log(`backend server running at ${getURL()}`);
});

// Socket.io initialization
const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

// Socket.io middleware
// io.use(wrap(checkJWT))

// Socket.io listeners
io.on('connection', (socket) => {
	try {
		console.log(socket.id, 'connected');
		socket.on('active_chat', (data) => {
			console.log(data);
			socket.join(data);
		});

		socket.on('send_message', (matchID, data) => {
			if (!matchID) return;
			console.log(matchID, data);

			// Save message to database
			const response = saveMessageToDatabase(data)
			if(!response) throw new Error('Failed to save message. Please try again.')

			// Emit to receiver
			socket.to(matchID).emit('receive_message', matchID, data);
		});
		socket.on('disconnect', () => console.log(socket.id, 'disconnected'));
	} catch (err) {
		console.error(err);
	}
});

// *** Endpoints without JWT auth ***
app.get('/', (req: express.Request, res: express.Response) => {
	res.send('backend server is running');
});

// Login and logout
app.post('/login', login);
app.post('/logout', logout);

// Refresh token
app.post('/token', refreshToken);

// Request new verification email
app.post('/emailtoken', sendNewEmailVerification);

// Request password reset email
app.post('/resetpasswordtoken', sendPasswordReset);

// Verify email address
app.post('/verifyemail', verifyEmailToken);

// *** Auth endpoints ***

// Reset password via email (auth with token posted in body)
app.post('/setpassword', resetPassword);

// Profile search
app.post('/search', checkJWT, searchProfiles);

// Log CRUD route
app.use('/log', logRouter);

// User CRUD route
app.use('/user', userRouter);

// Profile CRUD route
app.use('/profile', profileRouter);

// Image CRUD route
app.use('/image', imageRouter);

// Like CRUD route
app.use('/like', likeRouter);

// Match CRUD route
app.use('/match', matchRouter);

// Messages GET
app.get('/messages/:id', checkJWT, getChatMessages);
