import type { NextPage } from 'next';
import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import { useUserContext } from '../../components/UserContext';
import {
	LoadStatus,
	IMatch,
	ChatProps,
	ActivePage,
	NotificationType,
	BooleanProp,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { createSQLDatetimeString, reformatDate } from '../../utilities/helpers';
import { IoMdSend } from 'react-icons/io';
import { useRouter } from 'next/router';
import { useSocketContext } from '../../components/SocketContext';
import { useNotificationContext } from '../../components/NotificationContext';
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';
import { IconContext } from 'react-icons';
import { BsThreeDots, BsThreeDotsVertical } from 'react-icons/bs';
import { FaCircle } from 'react-icons/fa';

const NotLoggedIn = () => {
	return (
		<div>
			<section className="section">
				<p>Please log in first.</p>
			</section>
		</div>
	);
};

const LoggedIn = () => {
	const { profile, setProfile, userData } = useUserContext();
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const { setNotificationCount, setMessageCount, setLikeCount } =
		useNotificationContext();
	const router = useRouter();

	if (!userData.profile_exists) router.replace('/profile');

	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({ ...profile, geolocation: position }),
				(error) =>
					console.log('Geolocation not permitted by user.', error)
			);
		}
		markMessageNotificationsRead();
	}, []);

	const markMessageNotificationsRead = async () => {
		const response = await authAPI.patch('/notifications', {
			type: NotificationType.MESSAGE,
			user_id: userData.user_id,
		});
		if (response.status === 200) {
			setNotificationCount(0);
			setMessageCount(0);
			setLikeCount(0);
		}
	};
	return (
		<div className="column is-11 is-flex is-flex-direction-row is-justify-content-center is-align-content-center fullwidth">
			<ChatWindow />
			<MatchList />
		</div>
	);
};
const Modal = ({
	showModal,
	closeModal,
	handleSubmit,
	title,
	buttonTitle,
	children,
}: any) => {
	return showModal ? (
		<div className="modal is-active">
			<div className="modal-background"></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">{title}</p>
					<button
						className="delete"
						aria-label="close"
						onClick={closeModal}
					></button>
				</header>
				<section className="modal-card-body">{children}</section>
				<footer className="modal-card-foot">
					<button
						className="button is-success"
						onClick={handleSubmit}
					>
						{buttonTitle}
					</button>
					<button className="button" onClick={closeModal}>
						Cancel
					</button>
				</footer>
			</div>
		</div>
	) : null;
};
const ReportMenu = ({ reporter, reported }: any) => {
	const [showReportModal, setShowReportModal] = useState(false);
	const [showBlockModal, setShowBlockModal] = useState(false);
	const [reason, setReason] = useState('');

	const handleBlockSubmit = async () => {
		const response = await authAPI.post('/blockuser', {
			blocked: reported,
			blocker: reporter,
			reason: reason,
		});
		if (response.status === 200) {
			setShowBlockModal(false);
		}
	};
	const handleReportSubmit = async () => {
		const response = await authAPI.post('/reportuser', {
			reported: reported,
			reporter: reporter,
			reason: reason,
		});
		if (response.status === 200) {
			setShowBlockModal(false);
		}
	};
	return (
		<div>
			<Modal
				showModal={showBlockModal}
				closeModal={() => setShowBlockModal(false)}
				handleSubmit={handleBlockSubmit}
				title={'Block user'}
				buttonTitle={'Block user'}
			>
				<p>
					Blocking user will hide user profile from you and remove
					match and like if they exist. You won't be able to contact
					each other anymore. This action cannot be reversed.
				</p>
				<p>
					Please tell us below why you decided to block this user, so
					we can make this safer environment for everybody.
				</p>
				<div className="block">
					<label className="label">
						Reason for blocking this user
					</label>
					<div className="select is-primary">
						<select
							id="blockreason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							required
						>
							<option value={''} disabled>
								Select reason for blocking
							</option>
							<option value={1}>Harrasment</option>
							<option value={2}>I don't like this person</option>
							<option value={3}>
								Threaths my life or health
							</option>
							<option value={4}>
								Criminal activity or terrorism
							</option>
						</select>
					</div>
				</div>
			</Modal>
			<Modal
				showModal={showReportModal}
				closeModal={() => setShowReportModal(false)}
				handleSubmit={handleReportSubmit}
				title={'Report user'}
				buttonTitle={'Report user'}
			>
				<p>
					Is there something wrong with this profile? Is it fake or
					does it go against our community standards? If so, tell us
					below what exactly is wrong.
				</p>
				<p>
					If you don't want to see this profile anymore and want to
					prevent the user from matching or contacting with you,
					please block the user separately.
				</p>
				<div className="block">
					<label className="label">
						Reason for reporting this user
					</label>
					<div className="select is-primary">
						<select
							id="reportreason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							required
						>
							<option value={''} disabled>
								Select reason for reporting
							</option>
							<option value={1}>Fake account</option>
							<option value={2}>Pornography</option>
							<option value={3}>Racism</option>
							<option value={4}>Violent content</option>
							<option value={5}>
								Criminal activity or terrorism
							</option>
						</select>
					</div>
				</div>
			</Modal>
			<div className="dropdown is-hoverable is-pulled-right">
				<div className="dropdown-trigger">
					<div className="navbar-item" id="controlpanel">
						<div>
							<BsThreeDotsVertical />
						</div>
					</div>
				</div>
				<div className="dropdown-menu" id="dropdown-menu" role="menu">
					<div className="dropdown-content">
						<a
							className="dropdown-item"
							onClick={() => setShowBlockModal(true)}
						>
							Block user
						</a>
						<a
							className="dropdown-item"
							onClick={() => setShowReportModal(true)}
						>
							Report user
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
const MatchList = () => {
	const { profile, setProfile } = useUserContext();
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [matches, setMatches] = useState<IMatch[]>([]);
	const { matchData, setMatchData, setActivePage } = useNotificationContext();

	useEffect(() => {
		const getUsersMatches = async () => {
			let response = await authAPI.get(`/match/${profile.user_id}`);
			if (response.status === 200) {
				setMatches(response.data.matches);
			}
		};
		getUsersMatches();
		setActivePage(ActivePage.MESSAGES);
	}, []);

	return matches.length > 0 ? (
		<div className="is-flex is-flex-direction-column match-list">
			<h5 className="title is-5">Matches</h5>
			{matches.map((match, index) => (
				<MatchListItem
					key={index}
					match={match}
					matchData={matchData}
					setMatchData={setMatchData}
					user_id={profile.user_id}
				/>
			))}
		</div>
	) : (
		<div>
			<section className="section">
				<p>No matches yet. Go discover!</p>
			</section>
		</div>
	);
};

const OnlineIndicator = ({ onlineStatus }: BooleanProp) => {
	return onlineStatus ? (
			<IconContext.Provider
				value={{
					color: 'green',
					size: '0.75rem',
					className: 'react-icons',
				}}
			>
				<div>
					<FaCircle />
				</div>
			</IconContext.Provider>
	) : (
		<IconContext.Provider
			value={{
				color: 'gray',
				size: '0.75rem',
				className: 'react-icons',
			}}
		>
			<div>
				<FaCircle />
			</div>
		</IconContext.Provider>
	);
};
const MatchListItem = ({ match, user_id }: any) => {
	// Check if user is user1 or user2
	const name = user_id === match.user1 ? match.name2 : match.name1;
	const profile_image = user_id === match.user1 ? match.image2 : match.image1;
	const receiver_id = user_id === match.user1 ? match.user2 : match.user1;
	const { matchData, setMatchData, setActiveChatUser } =
		useNotificationContext();

	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault();
		setMatchData({
			match_id: match.match_id,
			sender_id: user_id,
			receiver_id: receiver_id,
		});
		setActiveChatUser(receiver_id);
	};

	return matchData.match_id === match.match_id ? (
		<article
			className="media has-background-grey-lighter is-clickable"
			onClick={handleClick}
		>
			<figure className="media-left">
				<p className="image is-64x64">
					<img
						className="is-rounded"
						src={`${authAPI.defaults.baseURL}/images/${profile_image}`}
						onError={({ currentTarget }) => {
							currentTarget.onerror = null;
							currentTarget.src = '/default.png';
						}}
						alt="Profile picture"
						crossOrigin=""
					/>
				</p>
			</figure>
			<div className="media-content">
				<div className="content">
					<p>
						<strong className="is-size-7">{name}</strong>
						<OnlineIndicator onlineStatus={match.online} />
						<ReportMenu reporter={user_id} reported={receiver_id} />
						<br />
						<span className="help">{`Matched on ${reformatDate(
							match.match_date
						)}`}</span>
					</p>
				</div>
			</div>
		</article>
	) : (
		<article className="media is-clickable" onClick={handleClick}>
			<figure className="media-left">
				<p className="image is-64x64">
					<img
						className="is-rounded"
						src={`${authAPI.defaults.baseURL}/images/${profile_image}`}
						onError={({ currentTarget }) => {
							currentTarget.onerror = null;
							currentTarget.src = '/default.png';
						}}
						alt="Profile picture"
						crossOrigin=""
					/>
				</p>
			</figure>
			<div className="media-content">
				<div className="content">
					<p>
						<strong className="is-size-7">{name}</strong>
						<OnlineIndicator onlineStatus={match.online} />
						<ReportMenu reporter={user_id} reported={receiver_id} />
						<br />
						<span className="help">{`Matched on ${reformatDate(
							match.match_date
						)}`}</span>
					</p>
				</div>
			</div>
		</article>
	);
};

const ChatWindow = () => {
	const [received, setReceived] = useState<{}[]>([]);
	const [outgoing, setOutgoing] = useState('');
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const { profile } = useUserContext();
	const socket = useSocketContext();
	const { matchData } = useNotificationContext();
	const windowBottom: MutableRefObject<any> = useRef(null);

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setOutgoing(event.target.value);

	const scrollToBottom = () => {
		windowBottom?.current?.scrollIntoView();
	};
	useEffect(() => {
		scrollToBottom();
	}, [received]);

	const emitMessageAndNotification = (
		matchData: any,
		payload: {},
		notification: {}
	) => {
		socket.emit('send_message', matchData.match_id, payload);
		socket.emit('send_notification', matchData.receiver_id, notification);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (outgoing.length < 1) return;
		try {
			setLoadStatus(LoadStatus.LOADING);
			const payload = {
				match_id: matchData.match_id,
				sender_id: matchData.sender_id,
				receiver_id: matchData.receiver_id,
				name: profile.name,
				message_text: outgoing,
				message_time: createSQLDatetimeString(),
			};
			const notification = {
				sender_id: matchData.sender_id,
				receiver_id: matchData.receiver_id,
				notification_type: NotificationType.MESSAGE,
				notification_text: 'You received a new message.',
				link: '/messages',
			};
			setReceived((current) => [...current, payload]);
			emitMessageAndNotification(matchData, payload, notification);
			selectChat();
			setOutgoing('');
		} catch (err) {
			console.error(err);
		}
	};
	const selectChat = async () => {
		try {
			if (!matchData.match_id) return;
			setReceived([]);
			socket.emit('active_chat', matchData.match_id);
			const response = await authAPI(`/messages/${matchData.match_id}`);
			if (response?.data?.messages?.length > 0)
				setReceived([...response.data.messages]);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		try {
			socket.on('receive_message', (data) => {
				setReceived((current) => [...current, data]);
			});
			return () => {
				socket.removeAllListeners('receive_message');
			};
		} catch (err) {
			console.error(err);
		}
	}, [socket]);

	useEffect(() => {
		selectChat();
	}, [matchData.match_id]);

	return matchData.match_id ? (
		<div className="fullwidth">
			<div className="section is-flex is-flex-direction-column is-justify-content-center is-align-content-center chat-window">
				{received.map((item, index) => (
					<ChatMessage
						key={index}
						item={item}
						user_id={profile.user_id}
					/>
				))}
				<div ref={windowBottom} className="is-invisible">
					.
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className="m-6 chat-input has-background-white"
			>
				<div className="field has-addons">
					<div className="control fullwidth">
						<input
							type="text"
							className="input is-primary"
							placeholder="Write something"
							name="message"
							onChange={onChange}
							onFocus={scrollToBottom}
							value={outgoing}
						/>
					</div>
					<div className="control">
						<button className="button is-primary mr-3">
							<span className="icon">
								<IoMdSend />
							</span>
							<span>Send</span>
						</button>
					</div>
				</div>
			</form>
		</div>
	) : (
		<div className="column">
			<section className="section">
				<p>Select one of your matches and start chatting!</p>
			</section>
		</div>
	);
};

const ChatMessage = ({ item, user_id }: any) => {
	return user_id === item.user_id ? (
		<div className="card has-background-primary-light  is-align-self-flex-end m-3">
			<div className="m-3">{item.message_text}</div>
			<div className="is-flex is-flex-direction-row is-flex-wrap-nowrap">
				<div className="help has-text-weight-bold m-3">{item.name}</div>
				<div className="help m-3">
					{new Date(item.message_time).toLocaleTimeString() ||
						new Date(item.time).toLocaleTimeString()}
				</div>
			</div>
		</div>
	) : (
		<div className="card has-background-primary-light  is-align-self-flex-start m-3">
			<div className="m-3">{item.message_text}</div>
			<div className="is-flex is-flex-direction-row is-flex-wrap-nowrap">
				<div className="help has-text-weight-bold m-3">{item.name}</div>
				<div className="help m-3">
					{new Date(item.message_time).toLocaleTimeString() ||
						new Date(item.time).toLocaleTimeString()}
				</div>
			</div>
		</div>
	);
};
const Messages: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="">
			<div className="columns is-centered">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Messages;
