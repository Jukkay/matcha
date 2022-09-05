import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { Gallery, OnlineIndicator } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import {
	ActivePage,
	BooleanProp,
	IOtherUserProfile,
	IProfile,
	LikeButtonProps,
	NotificationType,
	OtherUserViewProps,
	ProfileViewProps,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { FcLike, FcDislike } from 'react-icons/fc';
import {
	convertBirthdayToAge,
	distanceBetweenPoints,
	reformatDate,
	reformatDateTime,
} from '../../utilities/helpers';
import { useNotificationContext } from '../../components/NotificationContext';
import { useSocketContext } from '../../components/SocketContext';

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
			online: false,
			last_login: '',
		}
	);
	const { userData } = useUserContext();
	const { setActivePage } = useNotificationContext();
	const [profileExists, setProfileExists] = useState(false);
	const socket = useSocketContext();
	const router = useRouter();
	if (!userData.profile_exists) router.replace('/profile');

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
		} catch (err) {
			console.error(err);
		}
	};

	const getUserProfile = async () => {
		try {
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
			console.error(err);
		} finally {
			logVisit();
		}
	};

	useEffect(() => {
		if (router.isReady) {
			getUserProfile();
		}
		setActivePage(ActivePage.OTHER_PROFILE);
	}, [router.isReady]);

	return profileExists ? (
		<ViewMode
			otherUserProfile={otherUserProfile}
			setOtherUserProfile={setOtherUserProfile}
		/>
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No profile found.</h3>
		</section>
	);
};

const LikeButton = ({
	profile,
	setProfile,
	setNotification,
}: LikeButtonProps) => {
	const { userData } = useUserContext();
	const socket = useSocketContext();

	const likeProfile = async () => {
		const liked = profile.user_id;
		const liker = userData.user_id;

		const response = await authAPI.post('/like', {
			liker: liker,
			liked: liked,
		});
		console.log('Sending like');
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
				setProfile({ ...profile, like_id: 1, match_id: 1 });
				setNotification(true);
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
			} else setProfile({ ...profile, like_id: 1 });
		}
	};
	const handleClick = () => {
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
	setOtherUserProfile,
}: OtherUserViewProps) => {
	const { userData } = useUserContext();
	const socket = useSocketContext();

	const unlikeProfile = async () => {
		const liked = otherUserProfile.user_id;
		const liker: number = userData.user_id;

		const response = await authAPI.delete(
			`/like?liker=${liker}&liked=${liked}`,
			{}
		);
		console.log('Removing like');
		if (response.status === 200) {
			setOtherUserProfile({ ...otherUserProfile, like_id: 0 });
		}

		// Emit notification
		const notification = {
			sender_id: liker,
			receiver_id: liked,
			notification_type: NotificationType.UNLIKE,
			notification_text: `Somebody unliked you!`,
			link: `/profile/${liker}`,
		};
		socket.emit('send_notification', liked, notification);
	};
	const handleClick = () => {
		unlikeProfile();
	};
	return (
		<button className="button is-medium" onClick={handleClick}>
			<span className="icon is-medium">
				<FcDislike />
			</span>
			<span>Unlike</span>
		</button>
	);
};

const ViewMode = ({
	otherUserProfile,
	setOtherUserProfile,
}: OtherUserViewProps) => {
	const [notification, setNotification] = useState(false);
	const { profile } = useUserContext();

	const closeNotification = () => {
		setNotification(false);
	};
	return (
		<div className="columns card my-6">
			<div className="column card-image has-text-left is-two-thirds">
				<Gallery user_id={otherUserProfile.user_id} />
			</div>
			<div className="column has-text-left">
				<div className="">Name:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.name}
				</div>
				<div className="">Age:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.birthday &&
						convertBirthdayToAge(otherUserProfile.birthday)}
				</div>
				<div className="">City:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.city}
				</div>
				<div className="">Country:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.country}
				</div>
				<div className="">Distance:</div>
				<div className="block ml-6 has-text-weight-bold">
					{`${distanceBetweenPoints(
						profile.user_latitude
							? profile.user_latitude
							: profile.latitude,
						profile.user_longitude
							? profile.user_longitude
							: profile.longitude,
						otherUserProfile.user_latitude
							? otherUserProfile.user_latitude
							: otherUserProfile.latitude,
						otherUserProfile.user_longitude
							? otherUserProfile.user_longitude
							: otherUserProfile.longitude
					)} km`}
				</div>
				<div className="">Famerating:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.famerating}
				</div>

				<div className="">Introduction:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.introduction}
				</div>
				<div className="">Interests:</div>
				<div className="block">
					{otherUserProfile.interests.length > 0
						? otherUserProfile.interests.map((interest, index) => (
								<span
									className="tag is-primary mx-2 my-1"
									key={index}
								>
									{interest}
								</span>
						  ))
						: null}
				</div>
				<div className="">Gender:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.gender}
				</div>
				<div className="">Looking for:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.looking}
				</div>
				<div className="block">Minimum age:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.min_age}
				</div>
				<div className="block">Maximum age:</div>
				<div className="block ml-6 has-text-weight-bold">
					{otherUserProfile.max_age}
				</div>
				<div className="block">Last login:</div>
				<div className="block ml-6 has-text-weight-bold">
					{reformatDateTime(otherUserProfile.last_login)}
				</div>
				<div className="block">
					<OnlineIndicator onlineStatus={otherUserProfile.online} />
				</div>
				{otherUserProfile.match_id && notification ? (
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
					{otherUserProfile.liked ? (
						<UnlikeButton
							otherUserProfile={otherUserProfile}
							setOtherUserProfile={setOtherUserProfile}
						/>
					) : (
						<LikeButton
							profile={otherUserProfile}
							setProfile={setOtherUserProfile}
							setNotification={setNotification}
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
