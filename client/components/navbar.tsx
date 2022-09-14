import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconContext } from 'react-icons';
import { FaHeart, FaBell } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { BsFillChatFill } from 'react-icons/bs';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';
import { useSocketContext } from './SocketContext';
import { useNotificationContext } from './NotificationContext';
import { INotification, LikeProp, NotificationType } from '../types/types';
import axios from 'axios';
import { socket } from './SocketContext'

const LoggedOutControls = () => {
	return (
		<div className="is-flex is-justify-content-space-between is-flex-wrap-nowrap fullwidth">
			<div className="navbar-brand">
				<Logo />
			</div>
			<div className="is-flex is-justify-content-space-between fullwidth is-flex-wrap-nowrap">
				<div className="is-flex is-justify-content-end is-flex-wrap-nowrap is-align-items-center fullwidth buttons mr-6">
					<Link href="/signup">
						<a className="button is-primary">Sign up</a>
					</Link>
					<Link href="/login">
						<a className="button">Log in</a>
					</Link>
				</div>
			</div>
		</div>
	);
};

const Logo = () => {
	return (
		<Link href="/">
			<a className="navbar-item pt-3">
				<span className="icon is-medium">
					<FaHeart />
				</span>
			</a>
		</Link>
	);
};
const LoggedInControls = () => {
	const { refreshToken, userData, updateAccessToken } = useUserContext();
	const {
		activeChatUser,
		activePage,
		notifications,
		setNotifications,
		notificationCount,
		setNotificationCount,
		setLikeCount,
		setMessageCount,
		messageCount,
		likeCount,
	} = useNotificationContext();
	// const socket = useSocketContext();

	const getNotifications = async () => {
		try {
			if (!userData.user_id) return;
			socket.emit('set_user', userData.user_id);
			const response = await authAPI(
				`/notifications/${userData.user_id}`
			);
			if (response?.data?.notifications?.length > 0) {
				setNotifications([...response.data.notifications]);
			} else {
				setNotificationCount(0);
				setLikeCount(0);
				setMessageCount(0);
			}
		} catch (err) {
			console.error(err);
		}
	};

	// Subscribe for and fetch notifications
	useEffect(() => {
		getNotifications();
	}, [socket, userData.user_id]);

	// Listen for notifications
	useEffect(() => {
		try {
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
					console.log('AccessToken refreshed by socket handler');
					socket.connect();
				}
			});
			socket.on('receive_notification', (data) => {
				console.log('Received notification', data);
				if (
					activePage === data.notification_type ||
					activeChatUser === data.sender_id
				)
					return;
				if (data.notification_type === NotificationType.MESSAGE)
					setMessageCount(messageCount + 1);
				if (data.notification_type === NotificationType.LIKE)
					setLikeCount(likeCount + 1);
				setNotificationCount(notificationCount + 1);
			});
			return () => {
				socket.removeAllListeners('receive_notification');
				socket.removeAllListeners('connect_error');
			};
		} catch (err) {
			console.error(err);
		}
	}, [socket]);

	// Count notifications and update badges
	useEffect(() => {
		if (notifications?.length < 1) return;
		if (
			activePage ===
				notifications[notifications.length - 1].notification_type ||
			activeChatUser === notifications[notifications.length - 1].sender_id
		)
			return;
		// Update notification counts
		const all = notifications.filter((item: INotification) => {
			if (!item.notification_read) return true;
			return false;
		}).length;
		setNotificationCount(all);

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
	}, [notifications, activeChatUser, activePage]);

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
					<Username />
					<ProfilePicture />
					<MainDropdownMenu />
				</div>
			</div>
		</div>
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
							className="badge is-danger"
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
		<div className="dropdown is-hoverable is-right">
			<div className="dropdown-trigger">
				<a className="navbar-item">
					<span className="icon is-medium">
						<IconContext.Provider
							value={{
								size: '1.5rem',
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
	const {
		messageCount,
		setNotificationCount,
		setMessageCount,
		setLikeCount,
	} = useNotificationContext();
	return messageCount ? (
		<Link href="/messages">
			<a className="navbar-item">
				<span title="Badge top right" className="badge is-danger">
					{messageCount}
				</span>
				<span className="icon is-medium ">
					<IconContext.Provider
						value={{
							size: '1.2rem',
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
			<a className="navbar-item">
				<span className="icon is-medium">
					<IconContext.Provider
						value={{
							size: '1.2rem',
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
		const response = await authAPI(`/notifications/${userData.user_id}`);
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
	};
	return (
		<div className="dropdown is-hoverable">
			<div
				className="dropdown-trigger"
				onMouseEnter={markNotificationsRead}
			>
				{notificationCount ? (
					<a className="navbar-item">
						<span
							title="Badge top right"
							className="badge is-danger"
						>
							{notificationCount}
						</span>
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									size: '1.2rem',
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
					<a className="navbar-item">
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									size: '1.2rem',
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
						{notification.notification_time}
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

const Username = () => {
	const { userData } = useUserContext();
	return (
		<Link href="/profile" className="username">
			<a className="navbar-item">
				<strong>{userData.username}</strong>
			</a>
		</Link>
	);
};
const ProfilePicture = () => {
	const { profile } = useUserContext();
	return (
		<Link href="/profile">
			<a className="navbar-item">
				<figure className="image">
					<img
						className="is-rounded"
						src={
							profile.profile_image === 'default.png' ||
							!profile.profile_image
								? '/default.png'
								: `${authAPI.defaults.baseURL}/images/${profile.profile_image}`
						}
						onError={({ currentTarget }) => {
							currentTarget.onerror = null;
							currentTarget.src = '/default.png';
						}}
						alt="Profile picture"
						crossOrigin=""
					/>
				</figure>
			</a>
		</Link>
	);
};

const NavbarComponent = () => {
	// Token state
	const { accessToken } = useUserContext();
	return (
		<div className="column is-narrow">
			<nav
				className="navbar is-fixed-top"
				role="navigation"
				aria-label="main navigation"
			>
				{accessToken ? <LoggedInControls /> : <LoggedOutControls />}
			</nav>
		</div>
	);
};
export default NavbarComponent;
