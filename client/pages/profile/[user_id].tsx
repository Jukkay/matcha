import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { Gallery } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import {
	ActivePage,
	IProfile,
	NotificationType,
	OtherUserViewProps,
	ProfileViewProps,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { FcLike } from 'react-icons/fc';
import { convertBirthdayToAge } from '../../utilities/helpers';
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
	const [profile, setProfile] = useState<IProfile>({
		user_id: 0,
		name: '',
		birthday: '',
		profile_image: '',
		gender: '',
		looking: '',
		min_age: 0,
		max_age: 0,
		interests: {},
		introduction: '',
		country: '',
		city: '',
		latitude: '',
		longitude: '',
		famerating: 0,
	});
	const { userData, updateUserData} = useUserContext()
	const { setActivePage } = useNotificationContext()
	const [profileExists, setProfileExists] = useState(false);
	const socket = useSocketContext()
	const router = useRouter();
	if (!userData.profile_exists) router.replace('/profile');

	const logVisit = async () => {
		try {
			const { user_id } = router.query;
			await authAPI.post('/log', {
				visiting_user: userData.user_id,
				visited_user: user_id,
				username: userData.username
			});
			// Emit notification
			const notification = {
			sender_id: userData.user_id,
			receiver_id: Number(user_id),
			notification_type: NotificationType.VIEW,
			notification_text: `Somebody viewed your profile!`,
			link: `/profile/${userData.user_id}`
			}
			socket.emit('send_notification', Number(user_id), notification)
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
				setProfile(response.data.profile);
			} else setProfileExists(false);
		} catch (err) {
			console.error(err);
		} finally {
			logVisit()
		}
	};

	useEffect(() => {
		if (router.isReady) {
			getUserProfile();
		}
		setActivePage(ActivePage.OTHER_PROFILE)
	}, [router.isReady]);

	return profileExists ? (
		<ViewMode profile={profile} />
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No profile found.</h3>
		</section>
	);
};

const ViewMode = ({ profile }: OtherUserViewProps) => {
	const { userData } = useUserContext();
	const socket = useSocketContext()

	const likeProfile = async () => {
		const liked = profile.user_id;
		const liker = userData.user_id;
		
		const response = await authAPI.post('/like', {
			liker: liker,
			liked: liked,
		});
		console.log('Sending like')
		
		// Emit notification
		const notification = {
			sender_id: liker,
			receiver_id: liked,
			notification_type: NotificationType.LIKE,
			notification_text: `Somebody liked you!`,
			link: `/profile/${liker}`
		}
		socket.emit('send_notification', liked, notification)
	};
	const handleClick = () => {
		likeProfile();
	};

	return (
		<div>
			<section className="section">
				<Gallery user_id={profile.user_id} />
				<div className="block">Famerating: {profile.famerating}</div>
				<div className="block">Name: {profile.name}</div>
				<div className="block">
					Age:{' '}
					{profile.birthday && convertBirthdayToAge(profile.birthday)}
				</div>
				<div className="block">City: {profile.city}</div>
				<div className="block">Country: {profile.country}</div>
				<div className="block">
					Introduction: {profile.introduction}
				</div>
				<div className="block">
					Interests:{' '}
					{profile.interests
						? Object.entries(profile.interests).map(
								(interest, index) => (
									<span
										className="tag is-success is-medium is-rounded is-clickable mx-2 my-1"
										key={index}
									>
										{interest[1] as string}
									</span>
								)
						  )
						: null}
				</div>
				<div className="block">Gender: {profile.gender}</div>
				<div className="block">Looking for: {profile.looking}</div>
				<div className="block">Minimum age: {profile.min_age}</div>
				<div className="block">Maximum age: {profile.max_age}</div>
				<div className="block">User ID: {profile.user_id}</div>
				<div className="block buttons">
					<button
						className="button is-primary is-medium"
						onClick={handleClick}
					>
						<span className="icon is-medium">
							<FcLike />
						</span>
						<span>Like</span>
					</button>
				</div>
			</section>
		</div>
	);
};

const ShowProfile: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default ShowProfile;
