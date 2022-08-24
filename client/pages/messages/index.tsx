import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';
import { LoadStatus, IMatch, ChatProps } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { createSQLDatetimeString, reformatDate } from '../../utilities/helpers';
import { IoMdSend } from 'react-icons/io';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { profile } from 'console';

const socket = io('http://localhost:4000');

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
	const { profile, setProfile, userData, updateUserData } = useUserContext();
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [matchID, setMatchID] = useState(0);
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
	}, []);

	return (
		<div className="column is-11 is-flex is-flex-direction-row is-justify-content-center is-align-content-center fullwidth">
			<ChatWindow matchID={matchID} />
			<MatchList matchID={matchID} setMatchID={setMatchID} />
		</div>
	);
};

const MatchList = ({ matchID, setMatchID }: ChatProps) => {
	const { profile, setProfile } = useUserContext();
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [matches, setMatches] = useState<IMatch[]>([]);

	useEffect(() => {
		const getUsersMatches = async () => {
			let response = await authAPI.get(`/match/${profile.user_id}`);
			if (response.status === 200) {
				setMatches(response.data.matches);
			}
		};
		getUsersMatches();
	}, []);

	return matches.length > 0 ? (
		<div className="is-flex is-flex-direction-column">
			<h5 className="title is-5">Matches</h5>
			{matches.map((match, index) => (
				<MatchListItem
					key={index}
					match={match}
					matchID={matchID}
					setMatchID={setMatchID}
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

const MatchListItem = ({ match, matchID, setMatchID, user_id }: any) => {
	// Which if user is user1 or user2
	const name = user_id === match.user1 ? match.name2 : match.name1;
	const profile_image = user_id === match.user1 ? match.image2 : match.image1;

	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault();
		setMatchID(match.match_id);
	};

	return matchID === match.match_id ? (
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
						<br />
						<span className="is-italic has-text-grey-light is-size-7">
							"Last message"
						</span>
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
						<br />
						<span className="is-italic has-text-grey-light is-size-7">
							"Last message"
						</span>
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

const ChatWindow = ({ matchID }: any) => {
	const [received, setReceived] = useState<{}[]>([]);
	const [outgoing, setOutgoing] = useState('');
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const { profile } = useUserContext();

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setOutgoing(event.target.value);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (outgoing.length < 1) return;
		try {
			setLoadStatus(LoadStatus.LOADING);
			const payload = {
				match_id: matchID,
				user_id: profile.user_id,
				name: profile.name,
				message_text: outgoing,
				message_time: createSQLDatetimeString(),
			};
			socket.emit('send_message', matchID, payload);
			setReceived((current) => [...current, payload]);
			setOutgoing('');
		} catch (err) {
			console.error(err);
		}
	};
	const selectChat = async () => {
		try {
			if (!matchID) return;
			setReceived([]);
			socket.emit('active_chat', matchID);
			const response = await authAPI(`/messages/${matchID}`);
			if (response?.data?.messages.length > 0)
				setReceived([...response.data.messages]);
		} catch (err) {
			console.error(err);
		}
	};
	useEffect(() => {
		try {
			socket.on('receive_message', (matchID, data) => {
				console.log(matchID, data);
				setReceived((current) => [...current, data]);
			});
		} catch (err) {
			console.error(err);
		}
	}, [socket]);

	useEffect(() => {
		selectChat();
	}, [matchID]);

	return matchID ? (
		<div className="fullwidth is-clipped">
			<div className="section is-flex is-flex-direction-column is-justify-content-center is-align-content-center">
				{received.map((item, index) => (
					<ChatMessage
						key={index}
						item={item}
						user_id={profile.user_id}
					/>
				))}
			</div>

			<form onSubmit={handleSubmit} className="m-6">
				<div className="field has-addons">
					<div className="control fullwidth">
						<input
							type="text"
							className="input is-primary"
							placeholder="Write something"
							name="message"
							onChange={onChange}
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
	console.log(user_id, item.user_id);
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
