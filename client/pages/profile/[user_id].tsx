import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import React, { useState, useEffect, useRef } from 'react';
import { Gallery } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import {
	ActivePage,
	IOtherUserProfile,
	LikeButtonProps,
	LoadStatus,
	NotificationType,
	OtherUserViewProps,
	UnlikeButtonProps,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { FcLike, FcDislike } from 'react-icons/fc';
import {
	convertBirthdayToAge,
	reformatDateTime,
} from '../../utilities/helpers';
import { useNotificationContext } from '../../components/NotificationContext';
import { useSocketContext } from '../../components/SocketContext';
import { LoadError, Spinner } from '../../components/utilities';

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
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [otherUserProfile, setOtherUserProfile] = useState<IOtherUserProfile>(
		{
			user_id: 0,
			name: '',
			birthday: '',
			profile_image: '',
			gender: '',
			looking: '',
			min_age: 0,
			max_age: 0,
			interests: [],
			introduction: '',
			country: '',
			city: '',
			latitude: '',
			longitude: '',
			user_latitude: '',
			user_longitude: '',
			famerating: 0,
			liked: 0,
			likes_requester: 0,
			match_id: 0,
			last_login: '',
		}
	);
	const { userData } = useUserContext();
	const { setActivePage } = useNotificationContext();
	const [profileExists, setProfileExists] = useState(false);
	const socket = useSocketContext();
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();

	// Redirect if user has no profile
	useEffect(() => {
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
		router.replace('/profile');
	}, [userData.profile_exists]);

	const logVisit = async () => {
		try {
			const { user_id } = router.query;
			await authAPI.post('/log', {
				visiting_user: userData.user_id,
				visited_user: user_id,
				username: userData.username,
			});
			// Emit notification
			const notification = {
				sender_id: userData.user_id,
				receiver_id: Number(user_id),
				notification_type: NotificationType.VIEW,
				notification_text: `Somebody viewed your profile!`,
				link: `/profile/${userData.user_id}`,
			};
			socket.emit('send_notification', Number(user_id), notification);
		} catch (err) {}
	};

	const getUserProfile = async () => {
		try {
			setLoadStatus(LoadStatus.LOADING);
			const { user_id } = router.query;
			let response = await authAPI.get(`/profile/${user_id}`);
			if (response?.data?.profile) {
				setProfileExists(true);
				response.data.profile.interests = JSON.parse(
					response.data.profile.interests
				);
				setOtherUserProfile(response.data.profile);
			} else setProfileExists(false);
		} catch (err) {
			setLoadStatus(LoadStatus.ERROR);
			console.error(err);
		} finally {
			logVisit();
			setLoadStatus(LoadStatus.IDLE);
		}
	};

	useEffect(() => {
		if (router.isReady) {
			getUserProfile();
		}
		setActivePage(ActivePage.OTHER_PROFILE);
	}, [router.isReady]);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profile" />;

	return profileExists ? (
		<ViewMode otherUserProfile={otherUserProfile} />
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No profile found.</h3>
		</section>
	);
};

const LikeButton = ({ profile, setLiked, setMatch }: LikeButtonProps) => {
	const { userData } = useUserContext();
	const socket = useSocketContext();

	const likeProfile = async () => {
		const liked = profile.user_id;
		const liker = userData.user_id;
		try {
			const response = await authAPI.post('/like', {
				liker: liker,
				liked: liked,
			});

			if (response.status === 200) {
				// Emit notification
				const notification = {
					sender_id: liker,
					receiver_id: liked,
					notification_type: NotificationType.LIKE,
					notification_text: `Somebody liked you!`,
					link: `/profile/${liker}`,
				};
				socket.emit('send_notification', liked, notification);
				// Send match notification
				if (response.data.match) {
					setMatch(true);
					const notification = {
						sender_id: liker,
						receiver_id: liked,
						notification_type: NotificationType.MATCH,
						notification_text: `You have a new match! Start a conversation`,
						link: `/profile/${liker}`,
					};
					socket.emit('send_notification', liked, notification);
					const notification2 = {
						sender_id: liker,
						receiver_id: liker,
						notification_type: NotificationType.MATCH,
						notification_text: `You have a new match! Start a conversation`,
						link: `/profile/${liked}`,
					};
					socket.emit('send_notification', liker, notification2);
				}
			}
		} catch (err) {}
	};
	const handleClick = () => {
		setLiked(true);
		likeProfile();
	};

	return (
		<button className="button is-primary is-medium" onClick={handleClick}>
			<span className="icon is-medium">
				<FcLike />
			</span>
			<span>Like</span>
		</button>
	);
};

const UnlikeButton = ({
	otherUserProfile,
	setLiked,
	setMatch,
}: UnlikeButtonProps) => {
	const { userData } = useUserContext();
	const socket = useSocketContext();

	const unlikeProfile = async () => {
		const liked = otherUserProfile.user_id;
		const liker: number = userData.user_id;
		try {
			await authAPI.delete(`/like?liker=${liker}&liked=${liked}`, {});

			// Emit notification
			const notification = {
				sender_id: liker,
				receiver_id: liked,
				notification_type: NotificationType.UNLIKE,
				notification_text: `Somebody unliked you!`,
				link: `/profile/${liker}`,
			};
			socket.emit('send_notification', liked, notification);
		} catch (err) {}
	};

	const handleClick = () => {
		setLiked(false);
		setMatch(false);
		unlikeProfile();
	};
	return (
		<button
			className="button is-medium has-background-primary-light"
			onClick={handleClick}
		>
			<span className="icon is-medium">
				<FcDislike />
			</span>
			<span>Unlike</span>
		</button>
	);
};

const ViewMode = ({ otherUserProfile }: OtherUserViewProps) => {
	const [liked, setLiked] = useState(otherUserProfile.liked);
	const [match, setMatch] = useState(false);
	
	const closeNotification = () => {
		setMatch(false);
	};
	return (
		<div className="columns card my-6">
			<div className="column card-image has-text-left is-two-thirds">
				<Gallery user_id={otherUserProfile.user_id} />
			</div>
			<div className="column mt-3 has-text-left m-3">
				<div className="block">
					<span className="has-text-weight-semibold mr-3">Name:</span>
					{otherUserProfile.name}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">Age:</span>
					{otherUserProfile.birthday &&
						convertBirthdayToAge(otherUserProfile.birthday)}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Famerating:
					</span>
					{otherUserProfile.famerating}
				</div>

				<div className="block">
					<span className="has-text-weight-semibold mr-3">City:</span>
					{otherUserProfile.city}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Country:
					</span>
					{otherUserProfile.country}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Interests:
					</span>
					{otherUserProfile.interests
						? otherUserProfile.interests.map(
								(interest: string, index: number) => (
									<span
										className="tag is-primary mx-2 my-1"
										key={index}
									>
										{interest}
									</span>
								)
						  )
						: null}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Introduction:
					</span>
					<p className="notification has-background-primary-light">
						{otherUserProfile.introduction}
					</p>
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Gender:
					</span>
					{otherUserProfile.gender}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Looking for:
					</span>
					{otherUserProfile.looking}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Minimum age:
					</span>
					{otherUserProfile.min_age}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Maximum age:
					</span>
					{otherUserProfile.max_age}
				</div>
				<div className="block">
					<span className="has-text-weight-semibold mr-3">
						Last login:
					</span>
					{reformatDateTime(otherUserProfile.last_login)}
				</div>
				{match ? (
					<div className="notification is-primary">
						<button
							className="delete"
							onClick={closeNotification}
						></button>
						<h3 className="title is-3">It's a match!</h3>
					</div>
				) : null}
				{otherUserProfile.likes_requester &&
				!otherUserProfile.match_id ? (
					<div className="notification is-primary is-light">
						<p className="is-3">{`${otherUserProfile.name} likes you. Like them back to match them!`}</p>
					</div>
				) : null}
				<div className="block buttons">
					{liked ? (
						<UnlikeButton
							otherUserProfile={otherUserProfile}
							setLiked={setLiked}
							setMatch={setMatch}
						/>
					) : (
						<LikeButton
							profile={otherUserProfile}
							setLiked={setLiked}
							setMatch={setMatch}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

const ShowProfile: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-two-thirds">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default ShowProfile;
