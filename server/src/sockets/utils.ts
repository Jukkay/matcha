import { IOnlineUser } from '../interfaces/token';

const onlineUsers: IOnlineUser[] = [];

export const updateOnlineUsers = (user_id: number, socket_id: string) => {
	const i = onlineUsers?.findIndex((item) => item.user_id === user_id);
	if (i && i > -1) {
		onlineUsers[i] = {
			user_id: user_id,
			socket_id: socket_id,
			active: Date.now(),
		};
	} else {
		onlineUsers.push({
			user_id: user_id,
			socket_id: socket_id,
			active: Date.now(),
		});
	}
};

export const queryOnlineUsers = (user_id: number) => {
	const maxTimeInactive = 1000 * 60 * 10;
	const i = onlineUsers?.findIndex((item) => item.user_id === user_id);
	if (i > -1) {
		if (Date.now() - onlineUsers[i].active < maxTimeInactive) return true;
		onlineUsers.splice(i, 1);
	}
	return false;
};

export const updateUserActivity = (socket_id: string) => {
	const i = onlineUsers?.findIndex((item) => item.socket_id === socket_id);
	if (i > -1) {
		onlineUsers[i] = { ...onlineUsers[i], active: Date.now() };
	}
};
