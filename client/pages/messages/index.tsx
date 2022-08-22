import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';
import { LoadStatus, IMatch, ChatProps } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { reformatDate } from '../../utilities/helpers';
import { IoMdSend } from 'react-icons/io';
import router from 'next/router';

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
	const [chat, setChat] = useState({
		match_id: 0,
		name: '',
		profile_image: '',
		match_date: '',
	});
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
			<ChatWindow chat={chat} />
			<MatchList chat={chat} setChat={setChat} />
		</div>
	);
};

const MatchList = ({ chat, setChat }: ChatProps) => {
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
				<MatchListItem key={index} match={match} setChat={setChat} />
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

const MatchListItem = ({ match, setChat }: any) => {
	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault();
		setChat({
			match_id: match.match_id,
			name: match.name,
			profile_image: match.profile_image,
			match_date: match.match_date,
		});
	};
	return (
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
						<p className="help">{`Matched on ${reformatDate(
							match.match_date
						)}`}</p>
					</p>
				</div>
			</div>
		</article>
	);
};
const ChatWindow = ({ chat }: any) => {
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const handleSubmit = async (event: React.SyntheticEvent) => {
		event.preventDefault();
		setLoadStatus(LoadStatus.LOADING);
	};
	return chat.match_id ? (
		<div className="column">
			<section className="section">
				<p>Now chatting with {chat.name}</p>
			</section>
			<div className="media-content">
				<form onSubmit={handleSubmit}>
					<div className="field has-addons">
						<div className="control textareawrapper">
							<input
                                type="text"
								className="input is-primary"
								placeholder="Write something"
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
		</div>
	) : (
		<div className="column">
			<section className="section">
				<p>Select one of your matches and start chatting!</p>
			</section>
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
