import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconContext } from 'react-icons';
import { FaBell } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { BsFillChatFill } from 'react-icons/bs';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';
import { useNotificationContext } from './NotificationContext';
import {
	INavbarProfile,
	INotification,
	LikeProp,
	NotificationType,
} from '../types/types';
import axios from 'axios';
import { socket } from './socket';
import { ErrorFallback } from './utilities';
import { ErrorBoundary } from 'react-error-boundary';

const LoggedOutControls = () => {
	return (
		<div className="is-flex is-justify-content-space-between is-flex-wrap-nowrap fullwidth">
			<div className="navbar-brand">
				<Logo />
			</div>
			<div className="is-flex is-justify-content-space-between fullwidth is-flex-wrap-nowrap">
				<div className="is-flex is-justify-content-end is-flex-wrap-nowrap is-align-items-center fullwidth buttons mr-6">
					<ErrorBoundary FallbackComponent={ErrorFallback}>
						<Link href="/signup">
							<a className="button has-text-primary">Sign up</a>
						</Link>
						<Link href="/login">
							<a className="button has-text-primary">Log in</a>
						</Link>
					</ErrorBoundary>
				</div>
			</div>
		</div>
	);
};

const Logo = () => {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Link href="/">
				<a className="navbar-item">
					<img className="image" src="/logo.svg" alt="Main page" />
				</a>
			</Link>
		</ErrorBoundary>
	);
};
const LoggedInControls = () => {
	const { refreshToken, userData, updateAccessToken, profile } =
		useUserContext();
	const {
		matchData,
		activePage,
		notifications,
		setNotifications,
		setNotificationCount,
		setLikeCount,
		setMessageCount,
		likeCount,
	} = useNotificationContext();

	// Fetch notifications
	useEffect(() => {
		if (!userData.user_id) return;
		const controller = new AbortController();
		const getNotifications = async () => {
			try {
				const response = await authAPI(
					`/notifications/${userData.user_id}`,
					{ signal: controller.signal }
				);
				if (response?.data?.notifications?.length > 0) {
					setNotifications([...response.data.notifications]);
				} else {
					setNotificationCount(0);
					setLikeCount(0);
					setMessageCount(0);
				}
			} catch (err) {}
		};
		getNotifications();
		return () => controller.abort();
	}, [userData.user_id]);

	// Listen for notifications
	useEffect(() => {
		if (!userData.user_id) return;
		try {
			if (socket.disconnected) socket.open();
			socket.on('connect', () => {
				socket.emit('set_user', userData.user_id);
			});
			socket.on('connect_error', async (err) => {
				if (err.message === 'Unauthorized') {
					const refreshResponse = await axios.post(`/token/`, {
						token: refreshToken,
						user_id: userData.user_id,
					});
					const newToken = refreshResponse.data.accessToken;
					socket.auth = {
						token: newToken,
						user_id: userData.user_id,
					};
					updateAccessToken(newToken);
					sessionStorage.setItem('accessToken', newToken);
					socket.connect();
				}
			});
			socket.on('receive_notification', (data) => {
				if (data.notification_type === NotificationType.MESSAGE) {
					if (matchData.receiver_id === data.sender_id) return;
					setMessageCount((messageCount: number) => messageCount + 1);
				} else if (data.notification_type === NotificationType.LIKE) {
					setLikeCount((likeCount: number) => likeCount + 1);
				} else {
					setNotificationCount(
						(notificationCount: number) => notificationCount + 1
					);
				}
			});
		} catch (err) {}
		return () => {
			socket.removeAllListeners('receive_notification');
			socket.removeAllListeners('connect_error');
			socket.removeAllListeners('connect');
		};
	}, [userData.user_id, matchData.receiver_id]);

	// Count notifications and update badges
	useEffect(() => {
		// if (notifications?.length < 1) return;
		// Update notification counts

		const likes = notifications.filter((item: INotification) => {
			if (
				!item.notification_read &&
				item.notification_type === NotificationType.LIKE
			)
				return true;
			return false;
		}).length;
		setLikeCount(likes);
		const messages = notifications.filter((item: INotification) => {
			if (
				!item.notification_read &&
				item.notification_type === NotificationType.MESSAGE
			)
				return true;
			return false;
		}).length;
		setMessageCount(messages);
		const all = notifications.filter((item: INotification) => {
			if (!item.notification_read) return true;
			return false;
		}).length;
		setNotificationCount(all - likes - messages);
	}, [notifications, matchData, activePage]);

	// Token state
	return (
		<div className="is-flex is-justify-content-space-between is-flex-wrap-nowrap fullwidth">
			<div className="navbar-brand">
				<Logo />
			</div>
			<div className="is-flex is-justify-content-space-between fullwidth is-flex-wrap-nowrap">
				<TextLinks likeCount={likeCount} />

				<div className="is-flex is-justify-content-end is-flex-wrap-nowrap is-align-items-center fullwidth">
					<NotificationDropdownMenu />
					<MessageIcon />
					<Profile
						username={userData.username}
						profile_image={profile.profile_image}
					/>
					<MainDropdownMenu />
				</div>
			</div>
		</div>
	);
};

const Profile = ({ username, profile_image }: INavbarProfile) => {
	const [path, setPath] = useState('');

	useEffect(() => {
		const filePath =
			profile_image === 'profile.svg' ||
			profile_image === '' ||
			profile_image === '0' ||
			profile_image === '1' ||
			profile_image === '2' ||
			profile_image === '3' ||
			profile_image === '4' ||
			profile_image === undefined
				? '/profile.svg'
				: `${authAPI.defaults.baseURL}/images/${profile_image}`;
		setPath(filePath);
	}, [profile_image]);
	return (
		<Link href="/profile">
			<a className="navbar-item fullheight">
				<div className="username mr-3">
					<strong>{username}</strong>
				</div>
				{path === '/profile.svg' ? (
					<img
						className="profile-icon"
						src={path}
						alt="Profile picture"
						crossOrigin=""
					/>
				) : (
					<figure className="image navbar-profile-image">
						<img
							className="is-rounded"
							src={path}
							onError={({ currentTarget }) => {
								currentTarget.onerror = null;
								currentTarget.src = '/profile.svg';
							}}
							alt="Profile picture"
							crossOrigin=""
						/>
					</figure>
				)}
			</a>
		</Link>
	);
};

const TextLinks = ({ likeCount }: LikeProp) => {
	return (
		<div className="is-flex-wrap-nowrap text-links">
			<Link href="/search">
				<a className="navbar-item">Search</a>
			</Link>
			<Link href="/history">
				<a className="navbar-item">Recent profiles</a>
			</Link>
			{likeCount ? (
				<Link href="/likes">
					<a className="navbar-item">
						<span
							title="Badge top right"
							className="badge is-danger mt-3"
						>
							{likeCount}
						</span>
						Likes
					</a>
				</Link>
			) : (
				<Link href="/likes">
					<a className="navbar-item">Likes</a>
				</Link>
			)}
		</div>
	);
};
const MainDropdownMenu = () => {
	return (
		<div className="dropdown is-hoverable is-right fullheight">
			<div className="dropdown-trigger">
				<a className="navbar-item fullheight">
					<span className="icon is-medium">
						<IconContext.Provider
							value={{
								className: 'react-icons',
							}}
						>
							<div>
								<FiMenu />
							</div>
						</IconContext.Provider>
					</span>
				</a>
			</div>
			<div className="dropdown-menu" id="dropdown-menu" role="menu">
				<div className="dropdown-content">
					<Link href="/search">
						<a className="dropdown-item">Search</a>
					</Link>
					<Link href="/history">
						<a className="dropdown-item">Recent profiles</a>
					</Link>

					<Link href="/likes">
						<a className="dropdown-item">Likes</a>
					</Link>
					<Link href="/controlpanel">
						<a className="dropdown-item">User settings</a>
					</Link>
					<Link href="/logout">
						<a className="dropdown-item">Log out</a>
					</Link>
				</div>
			</div>
		</div>
	);
};
const MessageIcon = () => {
	const { messageCount } = useNotificationContext();
	return messageCount ? (
		<Link href="/messages">
			<a className="navbar-item fullheight">
				<span title="Badge top right" className="badge is-danger mt-3">
					{messageCount}
				</span>
				<span className="icon is-medium">
					<IconContext.Provider
						value={{
							className: 'react-icons',
						}}
					>
						<div>
							<BsFillChatFill />
						</div>
					</IconContext.Provider>
				</span>
			</a>
		</Link>
	) : (
		<Link href="/messages">
			<a className="navbar-item fullheight">
				<span className="icon is-medium">
					<IconContext.Provider
						value={{
							className: 'react-icons',
						}}
					>
						<div>
							<BsFillChatFill />
						</div>
					</IconContext.Provider>
				</span>
			</a>
		</Link>
	);
};
const NotificationDropdownMenu = () => {
	const {
		notificationCount,
		setNotificationCount,
		setMessageCount,
		setLikeCount,
		setNotifications,
	} = useNotificationContext();
	const { userData } = useUserContext();

	const markNotificationsRead = async () => {
		if (!userData.user_id) return;
		try {
			const response = await authAPI(
				`/notifications/${userData.user_id}`
			);
			if (response?.data?.notifications?.length > 0) {
				setNotifications([...response.data.notifications]);
			}
			const response2 = await authAPI.patch('/notifications', {
				type: 'all',
				user_id: userData.user_id,
			});
			if (response2.status === 200) {
				setNotificationCount(0);
				setMessageCount(0);
				setLikeCount(0);
			}
		} catch (err) {}
	};
	return (
		<div className="dropdown is-hoverable fullheight">
			<div
				className="dropdown-trigger"
				onMouseEnter={markNotificationsRead}
			>
				{notificationCount ? (
					<a className="navbar-item fullheight">
						<span
							title="Badge top right"
							className="badge is-danger mt-3"
						>
							{notificationCount}
						</span>
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									className: 'react-icons',
								}}
							>
								<div>
									<FaBell />
								</div>
							</IconContext.Provider>
						</span>
					</a>
				) : (
					<a className="navbar-item fullheight">
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									className: 'react-icons',
								}}
							>
								<div>
									<FaBell />
								</div>
							</IconContext.Provider>
						</span>
					</a>
				)}
			</div>
			<div className="dropdown-menu" id="dropdown-menu" role="menu">
				<div className="dropdown-content">
					<NotificationsList />
				</div>
			</div>
		</div>
	);
};

const NotificationsList = () => {
	const { notifications } = useNotificationContext();

	return notifications.length ? (
		notifications.map((notification: INotification, index: number) => (
			<Link key={index} href={notification.link}>
				<a className="dropdown-item">
					<span className="">{notification.notification_text}</span>
					<span className="help">
						{new Date(
							notification.notification_time
						).toLocaleString()}
					</span>
				</a>
			</Link>
		))
	) : (
		<a className="dropdown-item">
			<span className="">No notifications</span>
		</a>
	);
};

const NavbarComponent = () => {
	// Token state
	const { accessToken } = useUserContext();
	return (
		<div className="column is-narrow">
			<nav
				className="navbar is-fixed-top is-primary"
				role="navigation"
				aria-label="main navigation"
			>
				<ErrorBoundary FallbackComponent={ErrorFallback}>
					{accessToken ? <LoggedInControls /> : <LoggedOutControls />}
				</ErrorBoundary>
			</nav>
		</div>
	);
};
export default NavbarComponent;
