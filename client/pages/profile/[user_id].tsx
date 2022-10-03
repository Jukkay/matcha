import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';
import {
	ActivePage,
	IOtherUserProfile,
	LoadStatus,
	NotificationType,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { handleRouteError } from '../../utilities/helpers';
import { useNotificationContext } from '../../components/NotificationContext';
import { useSocketContext } from '../../components/SocketContext';
import { LoadError, Spinner } from '../../components/utilities';
import { ProfileViewWithLikeButtons } from '../../components/profileCards';

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

	const logVisit = async (controller: AbortController) => {
		try {
			const { user_id } = router.query;
			await authAPI.post('/log', {
				visiting_user: userData.user_id,
				visited_user: user_id,
				username: userData.username,
				signal: controller.signal,
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

	const getUserProfile = async (controller: AbortController) => {
		try {
			setLoadStatus(LoadStatus.LOADING);
			const { user_id } = router.query;
			let response = await authAPI.get(`/profile/${user_id}`, {
				signal: controller.signal,
			});
			if (response?.data?.profile) {
				setProfileExists(true);
				response.data.profile.interests = JSON.parse(
					response.data.profile.interests
				);
				setOtherUserProfile(response.data.profile);
			} else setProfileExists(false);
		} catch (err) {
			setLoadStatus(LoadStatus.ERROR);
		} finally {
			setLoadStatus(LoadStatus.IDLE);
		}
	};

	useEffect(() => {
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		if (router.isReady) {
			getUserProfile(controller1);
			logVisit(controller2);
		}
		setActivePage(ActivePage.OTHER_PROFILE);
		return () => {
			controller1.abort();
			controller2.abort();
		};
	}, [router.isReady]);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profile" />;

	return profileExists ? (
		<ProfileViewWithLikeButtons otherUserProfile={otherUserProfile} />
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No profile found.</h3>
		</section>
	);
};

const ShowProfile: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered is-gapless">
			<div className="column is-two-thirds">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default ShowProfile;
