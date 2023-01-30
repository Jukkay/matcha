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
import {
	blockUser,
	login,
	logout,
	reportUser,
	updateLocationPermission,
} from './controllers/user';
import likeRouter from './routes/like';
import checkJWT from './middleware/checkJWT';
import { searchProfiles } from './controllers/search';
import logRouter from './routes/log';
import matchRouter from './routes/match';
import { getChatMessages } from './controllers/chat';
import {
	getNotifications,
	markNotificationsRead,
} from './controllers/notification';
import { getProfilesUserLikes } from './controllers/like';
import { updateLocation } from './controllers/updateLocation';
import { updateProfileImage } from './controllers/updateProfileImage';

const app = express();

// initialize db pool
SQLConnect.init();

// Middleware
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(helmet());
app.use(cors());
app.use('/images', express.static('./images'));

// *** Endpoints without JWT auth ***
app.get('/', (_req: express.Request, res: express.Response) => {
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

// Update user's location
app.post('/geolocation', checkJWT, updateLocation);

// Update user's location permission
app.post('/gpspermission', checkJWT, updateLocationPermission);

// Update user's profile image
app.post('/updateprofileimage', checkJWT, updateProfileImage);

export default app;
