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
import { blockUser, login, logout, reportUser } from './controllers/user';
import likeRouter from './routes/like';
import checkJWT from './middleware/checkJWT';
import { searchProfiles } from './controllers/search';
import logRouter from './routes/log';
import matchRouter from './routes/match';
import { Server } from 'socket.io';
import { getChatMessages, saveMessageToDatabase } from './controllers/chat';
import {
	getNotifications,
	markNotificationsRead,
	saveNotificationToDatabase,
} from './controllers/notification';
import { getProfilesUserLikes } from './controllers/like';
import checkSocketJWT from './middleware/checkSocketJWT';

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

// Socket.io listeners
let previousChat: any;
let previousUser: any;
let onlineUsers: any[] = [];

const updateOnlineUsers = (user_id: number, socket_id: string) => {
	const i = onlineUsers?.findIndex((item) => item.user_id === user_id);
	if (i && i > -1) {
		onlineUsers[i] = {user_id: user_id, socket_id: socket_id, active: Date.now()}
		console.log(onlineUsers[i], 'updated')
	} else {
		onlineUsers.push({
			user_id: user_id,
			socket_id: socket_id,
			active: Date.now(),
		});
		console.log(onlineUsers[onlineUsers.length - 1], 'added')
	}
};

const queryOnlineUsers = (user_id: number) => {
	const maxTimeInactive = 1000 * 60 * 5
	const i = onlineUsers?.findIndex((item) => item.user_id === user_id)
	if (i > -1) {
		if ((Date.now() - onlineUsers[i].active) < maxTimeInactive)
			return true;
		onlineUsers.splice(i, 1);
	}
	return false;
};

const updateUserActivity = (socket_id: string) => {
	const i = onlineUsers?.findIndex((item) => item.socket_id === socket_id)
	if (i > -1) {
		onlineUsers[i] = {...onlineUsers[i], active: Date.now()}
		console.log('updated user activity')
	}
};

// // Check socket token
// io.use((socket, next) => {
// 	const token = socket.handshake.auth.token;
// 	const user_id = socket.handshake.auth.user_id
// 	if (!token || !user_id) {
// 		console.log('Missing token or user_id')
// 		return next(new Error('Unauthorized'));
// 	}
// 	updateOnlineUsers(user_id, socket.id)
// 	if (checkSocketJWT(token)) {
// 		console.log('Token validated')
// 		next();
// 	} else {
// 		console.log('Invalid token')
// 		next(new Error('Unauthorized'));
// 	}
// });

io.on('connection', (socket) => {
	try {
		console.log(socket.id, 'connected');
		// Chat
		socket.on('active_chat', (data) => {
			socket.join(data);
			previousChat = data;
			updateUserActivity(socket.id)
			console.log('active chat is ', data);
		});

		socket.on('send_message', async (matchID, data) => {
			if (!matchID) return;

			// Save message to database
			const response = await saveMessageToDatabase(data);
			if (!response)
				throw new Error('Failed to save message. Please try again.');

			// Emit to receiver
			socket.to(matchID).emit('receive_message', data);
			console.log('Message sent to match ', matchID);
			updateUserActivity(socket.id)
		});

		// Notifications

		socket.on('set_user', (data) => {
			if (previousUser) {
				socket.leave(previousUser);
			}
			updateOnlineUsers(data, socket.id)
			console.log('Notifications for user_id: ', data);
			socket.join(data);
			previousUser = data;
		});

		socket.on('send_notification', async (user_id, data) => {
			if (!user_id) return;
			// Save notification to database
			await saveNotificationToDatabase(data);

			// Emit to user
			socket.to(user_id).emit('receive_notification', data);
			console.log('Notification sent to user_id', user_id);
			updateUserActivity(socket.id)
		});

		// Online query
		socket.on('online_query', (user_id) => {
			const onlineStatus = queryOnlineUsers(user_id);
			console.log('user', user_id, 'online status', onlineStatus);
			socket.emit('online_response', {
				queried_id: user_id,
				online: onlineStatus,
			});
			updateUserActivity(socket.id)
		});

		socket.on('disconnection', () =>
			console.log(socket.rooms, 'disconnected')
		);
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

// Notifications GET
app.get('/notifications/:id', checkJWT, getNotifications);

// Notifications PATCH
app.patch('/notifications/', checkJWT, markNotificationsRead);

// Get profiles user likes
app.get('/likedprofiles/:id', checkJWT, getProfilesUserLikes);

// Report user
app.post('/reportuser', checkJWT, reportUser);

// Block user
app.post('/blockuser', checkJWT, blockUser);
