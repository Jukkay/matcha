import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import { useUserContext } from '../../components/UserContext';
import { ActivePage, ILikeProfile, LogEntry, NotificationType } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { convertBirthdayToAge, reformatDate } from '../../utilities/helpers';

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
	const { userData, updateUserData, profile, setProfile } = useUserContext();
	const { setActivePage, setNotificationCount, setMessageCount, setLikeCount } = useNotificationContext();
	const [likedProfiles, setLikedProfiles] = useState<ILikeProfile[]>([]);
	const [likerProfiles, setLikerProfiles] = useState<ILikeProfile[]>([]);
	const router = useRouter();

	if (!userData.profile_exists) router.replace('/profile');

	const getLikerProfiles = async () => {
		let response = await authAPI.get(`/like/${userData.user_id}`);
		if (response.data.profiles.length > 0) {
			console.log(response.data.profiles);
			setLikerProfiles(response.data.profiles);
		}
	};

	const getLikedProfiles = async () => {
		let response = await authAPI.get(`/likedprofiles/${userData.user_id}`);
		if (response.data.profiles.length > 0) {
			console.log(response.data.profiles);
			setLikedProfiles(response.data.profiles);
		}
	};

	const markLikeNotificationsRead = async() => {
		const response = await authAPI.patch('/notifications', {type: NotificationType.LIKE, user_id: userData.user_id})
		if (response.status === 200) {
			setNotificationCount(0)
			setMessageCount(0)
			setLikeCount(0)
		}
	}

	useEffect(() => {
		getLikedProfiles();
		getLikerProfiles();
		markLikeNotificationsRead()
		setActivePage(ActivePage.LIKES);
	}, []);

	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({ ...profile, geolocation: position }),
				(error) =>
					console.log('Geolocation not permitted by user.', error)
			);
		}
	}, []);

	return likerProfiles.length > 0 || likedProfiles.length > 0 ? (
		<section className="section has-text-centered">
			<h3 className="title is-3">They liked your profile:</h3>
			<div className="block">
				{likerProfiles?.map((liker, index) => (
					<LikeProfile key={index} profile={liker} />
				))}
			</div>
			<h3 className="title is-3">You liked their profiles:</h3>
			<div className="block">
				{likedProfiles?.map((liker, index) => (
					<LikeProfile key={index} profile={liker} />
				))}
			</div>
		</section>
	) : (
		<section className="section">
			<h3 className="title is-3">No likes to show yet</h3>
		</section>
	);
};

const LikeProfile = ({ profile }: any) => {
	return (
		<Link href={`/profile/${profile.user_id}`}>
			<a>
				<div className="card">
					<div className="p-3 has-text-centered">
						<figure className="image is-128x128">
							<img
								src={`${authAPI.defaults.baseURL}/images/${profile.profile_image}`}
								alt="Placeholder image"
								crossOrigin=""
							/>
						</figure>
					</div>
					<div className="block">Name: {profile.name}</div>
					<div className="block">
						Age:{' '}
						{profile.birthday &&
							convertBirthdayToAge(profile.birthday)}
					</div>
					<div className="block">City: {profile.city}</div>
					<div className="block">Country: {profile.country}</div>
					<div className="block">
						Like date: {reformatDate(profile.like_date)}
					</div>
				</div>
			</a>
		</Link>
	);
};

const Likes: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Likes;
