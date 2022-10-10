import { createContext, ReactNode, useContext, useState } from 'react';
import { ActivePage, INotification } from '../types/types';

export const NotificationContext = createContext<any>(null);

export const useNotificationContext = () => {
	return useContext(NotificationContext);
};

export const NotificationContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [activePage, setActivePage] = useState<ActivePage>(ActivePage.NONE);
	const [matchData, setMatchData] = useState({
		match_id: 0,
		sender_id: 0,
		receiver_id: 0,
	});
	const [activeChatUser, setActiveChatUser] = useState(0);
	const [notifications, setNotifications] = useState<INotification[]>([]);
	const [notificationCount, setNotificationCount] = useState(0);
	const [messageCount, setMessageCount] = useState(0);
	const [likeCount, setLikeCount] = useState(0);
	const [viewCount, setViewCount] = useState(0);

	return (
		<NotificationContext.Provider
			value={{
				activePage,
				setActivePage,
				matchData,
				setMatchData,
				activeChatUser,
				setActiveChatUser,
				notifications,
				setNotifications,
				notificationCount,
				setNotificationCount,
				messageCount,
				setMessageCount,
				likeCount,
				setLikeCount,
				viewCount,
				setViewCount
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};
