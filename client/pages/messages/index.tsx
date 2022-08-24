import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';
import { LoadStatus, IMatch, ChatProps } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { reformatDate } from '../../utilities/helpers';
import { IoMdSend } from 'react-icons/io';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { profile } from 'console';

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
		<div className="columns">
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
		<div className="column is-one-quarter">
			<h5 className="title is-5">Matches</h5>
			{matches.map((match, index) => (
				<MatchListItem
					key={index}
					match={match}
					matchID={matchID}
					setMatchID={setMatchID}
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

const MatchListItem = ({ match, matchID, setMatchID }: any) => {
	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault();
		setMatchID(match.match_id);
	};
	return matchID === match.match_id ? (
		<article
			className="media has-background-grey-lighter p-2"
			onClick={handleClick}
		>
			<figure className="media-left">
				<p className="image is-64x64">
					<img
						className="is-rounded"
						src={`${authAPI.defaults.baseURL}/images/${match.profile_image}`}
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
						<strong className="is-size-7">{match.name}</strong>
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
		<article className="media" onClick={handleClick}>
			<figure className="media-left">
				<p className="image is-64x64">
					<img
						className="is-rounded"
						src={`${authAPI.defaults.baseURL}/images/${match.profile_image}`}
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
						<strong className="is-size-7">{match.name}</strong>
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

	const socket = io('http://localhost:4000');

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setOutgoing(event.target.value);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			setLoadStatus(LoadStatus.LOADING);
			const payload = {
				match_id: matchID,
				user_id: profile.user_id,
				name: profile.name,
				time: Date.now(),
				message: outgoing,
			};
			socket.emit('send_message', payload);
			setOutgoing('');
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		try {
			socket.on('receive_message', (data) => {
				console.log(data);
				setReceived((current) => [...current, data]);
			});
		} catch (err) {
			console.error(err);
		}
	}, [socket]);

	useEffect(() => {
		try {
			socket.emit('active_chat', matchID);
		} catch (err) {
			console.error(err);
		}
	}, [matchID]);

	return matchID ? (
		<div className="column">
			<section className="section">
				{received.map((item, index) => (
					<ChatMessage key={index} item={item} />
				))}
			</section>

			<form onSubmit={handleSubmit}>
				<div className="field has-addons">
					<div className="control textareawrapper">
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

const ChatMessage = ({ item }: any) => {
	return (
		<div className="columns">
			<div className="column is-1">
				{new Date(item.time).toLocaleTimeString()}
			</div>
			<div className="column is-1">{item.name}</div>
			<div className="column">{item.message}</div>
		</div>
	);
};
const Messages: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-11">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Messages;
