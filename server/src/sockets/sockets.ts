import { Server } from 'socket.io';
import { saveMessageToDatabase } from '../controllers/chat';
import { saveNotificationToDatabase } from '../controllers/notification';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { getClientURL, getServerToken } from '../utilities/checkENV';
import { error } from '../utilities/logger';
import { Server as HttpServer } from 'http';
import {
	queryOnlineUsers,
	updateOnlineUsers,
	updateUserActivity,
} from './utils';

export const sockets = (httpServer: HttpServer) => {
	try {
		// Socket.io initialization
		const io = new Server(httpServer, {
			cors: {
				origin: getClientURL(),
				methods: ['GET', 'POST'],
			},
		});
		// Check socket token
		io.use((socket, next) => {
			const token = socket.handshake.auth.token;
			const user_id = socket.handshake.auth.user_id;
			if (!token || !user_id) {
				return next(new Error('Unauthorized'));
			}
			jwt.verify(token, getServerToken(), (err: VerifyErrors | null) => {
				if (err) {
					return next(new Error('Unauthorized'));
				}
				updateOnlineUsers(user_id, socket.id);
				next();
			});
		});

		io.on('connection', (socket) => {
			// Chat
			socket.on('active_chat', (data) => {
				socket.join(data);
				updateUserActivity(socket.id);
			});

			socket.on('send_message', async (matchID, data) => {
				if (!matchID) return;
				// Save message to database
				const response = await saveMessageToDatabase(data);
				if (!response)
					throw new Error(
						'Failed to save message. Please try again.'
					);
				// Emit to receiver
				socket.to(matchID).emit('receive_message', data);
				updateUserActivity(socket.id);
			});

			// Notifications

			socket.on('set_user', (data) => {
				updateOnlineUsers(data, socket.id);
				socket.join(data);
			});

			socket.on('send_notification', async (user_id, data) => {
				if (!user_id) return;
				// Save notification to database
				await saveNotificationToDatabase(data);

				// Emit to user
				socket.to(user_id).emit('receive_notification', data);
				updateUserActivity(socket.id);
			});

			// Online query
			socket.on('online_query', (user_id) => {
				const onlineStatus = queryOnlineUsers(user_id);
				socket.emit('online_response', {
					queried_id: user_id,
					online: onlineStatus,
				});
				updateUserActivity(socket.id);
			});
		});
	} catch (err) {
		error(err);
	}
};
