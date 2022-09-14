import { authAPI } from '../utilities/api';
import { io, Socket } from 'socket.io-client';
import { createContext, ReactNode, useContext } from 'react';

interface ServerToClientEvents {
	receive_message: (message: any) => void;
	receive_notification: (message: any) => void;
	online_response: (data: any) => void;
}

interface ClientToServerEvents {
	send_message: (match_id: number, payload: {}) => void;
	send_notification: (receiver_id: number, notification: {}) => void;
	set_user: (receiver_id: number) => void;
	active_chat: (match_id: number) => void;
	online_query: (user_id: number) => void;
}

const getTokenFromSessionStorage = () => {
	if (typeof window === "undefined")
		return null
	return window.sessionStorage.getItem('accessToken')
}

const API = authAPI.defaults.baseURL || 'http://localhost:4000';
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API, {
	auth: { token: getTokenFromSessionStorage() },
});

export const SocketContext = createContext(socket);

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({children}: {children: ReactNode}) => {
	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	);
};
