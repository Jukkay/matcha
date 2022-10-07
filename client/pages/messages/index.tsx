import type { NextPage } from 'next';
import { useState, useEffect, useRef, MutableRefObject } from 'react';
import { useUserContext } from '../../components/UserContext';
import {
	LoadStatus,
	IMatch,
	ActivePage,
	NotificationType,
	OnlineStatusProps,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import {
	createSQLDatetimeString,
	handleRouteError,
} from '../../utilities/helpers';
import { IoMdSend } from 'react-icons/io';
import { useRouter } from 'next/router';
import { useNotificationContext } from '../../components/NotificationContext';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { LoadError, Spinner } from '../../components/utilities';
import { socket } from '../../components/socket';
import { useInView } from 'react-intersection-observer';
import { LandingPage } from '../../components/landingPage';

const LoggedIn = () => {
	const { userData } = useUserContext();
	const [loadStatus, _setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const { setMessageCount, setActivePage } = useNotificationContext();
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();

	// Router error event listener and handler
	useEffect(() => {
		router.events.on('routeChangeError', handleRouteError);
		return () => {
			router.events.off('routeChangeError', handleRouteError);
		};
	}, []);

	// Redirect if user has no profile
	useEffect(() => {
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
		router.replace('/profile');
	}, [userData.profile_exists]);

	useEffect(() => {
		markMessageNotificationsRead();
		setActivePage(ActivePage.MESSAGES)
		
	}, [userData.user_id]);

	const markMessageNotificationsRead = async () => {
		try {
			if (!userData.user_id) return;
			const response = await authAPI.patch('/notifications', {
				type: NotificationType.MESSAGE,
				user_id: userData.user_id,
			});
			if (response.status === 200) {
				setMessageCount(0);
			}
		} catch (err) {}
	};

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading messages" />;

	return (
		<div className="is-flex is-flex-direction-row is-justify-content-center is-align-content-center">
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
const ReportMenu = ({ reporter, reported, setMatchData, setActiveChatUser }: any) => {
	const [showReportModal, setShowReportModal] = useState(false);
	const [showBlockModal, setShowBlockModal] = useState(false);
	const [reason, setReason] = useState('');

	const handleBlockSubmit = async () => {
		try {
			const response = await authAPI.post('/blockuser', {
				blocked: reported,
				blocker: reporter,
				reason: reason,
			});
			if (response.status === 200) {
				setShowBlockModal(false);
				setActiveChatUser(0)
				setMatchData({})
			}
		} catch (err) {}
	};
	const handleReportSubmit = async () => {
		try {
			const response = await authAPI.post('/reportuser', {
				reported: reported,
				reporter: reporter,
				reason: reason,
			});
			if (response.status === 200) {
				setShowReportModal(false);
				setActiveChatUser(0)
				setMatchData({})
			}
		} catch (err) {}
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
					{`Blocking user will hide user profile from you and remove
					match and like if they exist. You won't be able to contact
					each other anymore. This action cannot be reversed.`}
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
							<option
								value={2}
							>{`I don't like this person`}</option>
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
					If you don&apos;t want to see this profile anymore and want
					to prevent the user from matching or contacting with you,
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
			<div className="p-2 dropdown is-right is-hoverable">
				<div className="dropdown-trigger">
					<div className="navbar-item" id="controlpanel">
						<BsThreeDotsVertical className="has-text-primary" />
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
	const { profile } = useUserContext();
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [matches, setMatches] = useState<IMatch[]>([]);
	const { matchData, setMatchData } = useNotificationContext();

	useEffect(() => {
		const getUsersMatches = async () => {
			if (!profile.user_id) return;
			try {
				setLoadStatus(LoadStatus.LOADING);
				let response = await authAPI.get(`/match/${profile.user_id}`);
				if (response.status === 200) {
					setMatches(response.data.matches);
				}
			} catch (err) {
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		getUsersMatches();
	}, [profile.user_id]);

	// useEffect(() => {
	// 	setMatchData({})
	// 	setActiveChatUser(0)
	// }, []);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading matches" />;

	return matches.length > 0 ? (
		<div className="column is-narrow is-flex is-flex-direction-column mt-6 match-list">
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

const OnlineIndicator = ({ user_id }: OnlineStatusProps) => {
	const [online, setOnline] = useState(false);

	// Query online status and listen for response
	useEffect(() => {
		try {
			if (socket.disconnected)
				socket.open()
			socket.on('online_response', (data) => {
				if (data.queried_id === user_id) setOnline(data.online);
			});
			socket.emit('online_query', user_id);
		} catch (err) {}
		return () => {
			socket.removeAllListeners('online_response');
		};
	}, [user_id]);

	return online ? (
		<div className="round-green"></div>
	) : (
		<div className="round-gray"></div>
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
		<div
			className="has-background-grey-lighter is-clickable is-flex is-justify-content-center is-align-items-center"
			onClick={handleClick}
		>
			<div className="p-2">
				<OnlineIndicator user_id={receiver_id} />
				<figure className="image is-64x64">
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
				</figure>
			</div>
			<div className="p-2">
				<strong className="is-size-7">{name}</strong>
			</div>
			<ReportMenu reporter={user_id} reported={receiver_id} setMatchData={setMatchData} setActiveChatUser={setActiveChatUser} />
		</div>
	) : (
		<div
			className="is-clickable is-flex is-justify-content-center is-align-items-center mr-6"
			onClick={handleClick}
		>
			<div className="p-2">
				<OnlineIndicator user_id={receiver_id} />
				<figure className="image is-64x64">
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
				</figure>
			</div>
			<div className="p-2">
				<strong className="is-size-7">{name}</strong>
			</div>
		</div>
	);
};

const ChatWindow = () => {
	const [received, setReceived] = useState<{}[]>([]);
	const [outgoing, setOutgoing] = useState('');
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const { matchData } = useNotificationContext();
	const windowBottom: MutableRefObject<any> = useRef(null);
	const { profile } = useUserContext();
	const [startIndex, setStartIndex] = useState(received.length);

	// Infinite scroll hooks
	const { ref, inView } = useInView({
		threshold: 0,
	});
	useEffect(() => {
		if (inView) {
			setStartIndex((startIndex) =>
				startIndex - 10 > 0 ? startIndex - 10 : 0
			);
		}
	}, [inView]);

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setOutgoing(event.target.value);

	const scrollToBottom = () => {
		windowBottom?.current?.scrollIntoView();
	};
	useEffect(() => {
		scrollToBottom();
		setStartIndex(received.length - 10 > 0 ? received.length - 10 : 0);
	}, [received]);

	const emitMessageAndNotification = (
		matchData: any,
		payload: {},
		notification: {}
	) => {
		if (socket.disconnected)
				socket.open()
		socket.emit('send_message', matchData.match_id, payload);
		socket.emit('send_notification', matchData.receiver_id, notification);
	};

	const selectChat = async (controller: AbortController) => {
		try {
			if (!matchData.match_id) return;
			setReceived([]);
			if (socket.disconnected)
				socket.open()
			socket.emit('active_chat', matchData.match_id);
			setLoadStatus(LoadStatus.LOADING);
			const response = await authAPI(`/messages/${matchData.match_id}`, {
				signal: controller.signal,
			});
			if (response?.data?.messages?.length > 0)
				setReceived([...response.data.messages]);
		} catch (err) {
			setLoadStatus(LoadStatus.ERROR);
		} finally {
			setLoadStatus(LoadStatus.IDLE);
		}
	};

	const sendMessage = async () => {
		if (outgoing.length < 1) return;
		const controller = new AbortController();
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
			await selectChat(controller);
			setOutgoing('');
		} catch (err) {
		} finally {
			controller.abort();
		}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		sendMessage();
	};

	useEffect(() => {
		try {
			if (socket.disconnected)
				socket.open()
			socket.on('receive_message', (data) => {
				console.log('Received message', data)
				setReceived((current) => [...current, data]);
			});
		} catch (err) {}
		return () => {
			socket.removeAllListeners('receive_message');
		};
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const selectChat = async () => {
			try {
				if (!matchData.match_id) return;
				setReceived([]);
				if (socket.disconnected)
					socket.open()
				socket.emit('active_chat', matchData.match_id);
				setLoadStatus(LoadStatus.LOADING);
				const response = await authAPI(
					`/messages/${matchData.match_id}`,
					{
						signal: controller.signal,
					}
				);
				if (response?.data?.messages?.length > 0)
					setReceived([...response.data.messages]);
			} catch (err) {
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		selectChat();
		return () => controller.abort();
	}, [matchData.match_id]);

	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading messages" />;

	return matchData.match_id ? (
		<div className="column">
			<div className="is-flex is-flex-direction-column mt-6 chat-window">
				{startIndex > 0 ? (
					<div ref={ref}></div>
				) : received.length > 0 ? (
					<section className="section has-text-centered">
						<h5 className="title is-5">No more messages</h5>
					</section>
				) : (
					<section className="section has-text-centered">
						<h3 className="title is-3">No messages to show</h3>
					</section>
				)}
				{received
					.slice(startIndex > 0 ? startIndex : 0, received.length)
					.map((item, index) => (
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
			<div className="chat-input has-background-white">
				<form onSubmit={handleSubmit}>
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
								autoFocus
							/>
						</div>
						<div className="control">
							<button
								className="button is-primary mr-6"
								type="submit"
							>
								<span className="icon">
									<IoMdSend />
								</span>
								<span>Send</span>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	) : (
		<div className="column">
			<section className="section has-text-centered">
				<h4 className="title is-4">
					Select one of your matches and start chatting!
				</h4>
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
		<div className="columns is-centered is-gapless mt-6">
			<div className="column is-11">
				{accessToken ? <LoggedIn /> : <LandingPage />}
			</div>
		</div>
	);
};

export default Messages;
