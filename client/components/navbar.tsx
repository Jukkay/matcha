import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconContext } from 'react-icons';
import { FaCog, FaHeart, FaBars, FaRegBell, FaBell } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { BsFillChatFill } from 'react-icons/bs';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';
import { useSocketContext } from './SocketContext';
import { useNotificationContext } from './NotificationContext';
import { INotification, NotificationType } from '../types/types';

const LoggedOutControls = () => {
	return (
		<>
			<Link href="/signup">
				<a className="button is-primary">Sign up</a>
			</Link>
			<Link href="/login">
				<a className="button">Log in</a>
			</Link>
		</>
	);
};

const LoggedInControls = () => {
	return (
		<>
			<NotificationDropdownMenu />
			<MessageIcon />
			<ProfilePicture />
			<MainDropdownMenu />
		</>
	);
};

const MainDropdownMenu = () => {
	return (
		<div className="dropdown is-hoverable">
			<div className="dropdown-trigger">
				<div className="navbar-item" id="controlpanel">
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
			</div>
			<div className="dropdown-menu" id="dropdown-menu" role="menu">
				<div className="dropdown-content">
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
				<div className="navbar-item" id="notifications">
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
const ProfilePicture = () => {
	const { userData, profile } = useUserContext();
	return (
		<div className="navbar-item" id="profile">
			<Link href="/profile">
				<a className="navbar-item">
					<p className="mr-3">
						<strong>{userData.username}</strong>
					</p>

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
		</div>
	);
};

const NavbarComponent = () => {
	const { userData } = useUserContext();
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
	const socket = useSocketContext();

	const getNotifications = async () => {
		console.log('getNotifications running');
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
	}, [userData.user_id]);

	// Listen for notifications
	useEffect(() => {
		try {
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
	const { accessToken } = useUserContext();
	return (
		<div className="column is-narrow">
			<nav
				className="navbar is-fixed-top"
				role="navigation"
				aria-label="main navigation"
			>
				<div className="navbar-brand">
					<Link href="/">
						<a className="navbar-item pt-3" href="/">
							<span className="icon is-medium">
								<IconContext.Provider
									value={{
										size: '1.2rem',
										className: 'react-icons',
									}}
								>
									<div>
										<FaHeart />
									</div>
								</IconContext.Provider>
							</span>
						</a>
					</Link>
					<a
						role="button"
						className="navbar-burger"
						aria-label="menu"
						aria-expanded="false"
						data-target="navbar-burger-button"
					>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
					</a>
				</div>
				<div
					className="navbar-menu is-hidden mobile-menu"
					id="navbar-mobile"
				>
					<div className="navbar-end">
						<Link href="/discover">
							<a className="navbar-item">Discover</a>
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
				</div>
				<div className="navbar-menu">
					<div className="navbar-start">
						<Link href="/discover">
							<a className="navbar-item">Discover</a>
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
					<div className="navbar-end">
						<div className="navbar-item">
							<div className="buttons" id="buttons">
								{accessToken
									? LoggedInControls()
									: LoggedOutControls()}
							</div>
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
};
export default NavbarComponent;
