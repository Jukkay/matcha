import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import { OnlineIndicator } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { ErrorFallback, LoadError, Spinner } from '../../components/utilities';
import {
	ActivePage,
	ILikeProfile,
	LoadStatus,
	NotificationType,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import {
	convertBirthdayToAge,
	handleRouteError,
} from '../../utilities/helpers';
import { ErrorBoundary } from 'react-error-boundary';

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
	const { userData } = useUserContext();
	const {
		setActivePage,
		setNotificationCount,
		setMessageCount,
		setLikeCount,
	} = useNotificationContext();
	const [likedProfiles, setLikedProfiles] = useState<ILikeProfile[]>([]);
	const [likerProfiles, setLikerProfiles] = useState<ILikeProfile[]>([]);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();

	// Router error event listener and handler
	useEffect(() => {
		router.events.on('routeChangeError', handleRouteError);

		// If the component is unmounted, unsubscribe
		// from the event with the `off` method:
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

	const getLikerProfiles = async (controller: AbortController) => {
		let response = await authAPI.get(`/like/${userData.user_id}`, {
			signal: controller.signal,
		});
		if (response.data.profiles.length > 0) {
			setLikerProfiles(response.data.profiles);
		}
	};
	const getLikedProfiles = async (controller: AbortController) => {
		let response = await authAPI.get(`/likedprofiles/${userData.user_id}`, {
			signal: controller.signal,
		});
		if (response.data.profiles.length > 0) {
			setLikedProfiles(response.data.profiles);
		}
	};

	const markLikeNotificationsRead = async (controller: AbortController) => {
		const response = await authAPI.patch('/notifications', {
			type: NotificationType.LIKE,
			user_id: userData.user_id,
			signal: controller.signal,
		});
		if (response.status === 200) {
			setLikeCount(0);
		}
	};

	useEffect(() => {
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const controller3 = new AbortController();
		setActivePage(ActivePage.LIKES);
		const fetchData = async () => {
			try {
				setLoadStatus(LoadStatus.LOADING);
				await getLikerProfiles(controller1);
				await getLikedProfiles(controller2);
				await markLikeNotificationsRead(controller3);
			} catch (err) {
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		fetchData();
		return () => {
			controller1.abort();
			controller2.abort();
			controller3.abort();
		};
	}, [userData.user_id]);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading likes" />;

	return (
		<section className="section has-text-centered">
			<h3 className="title is-3">They liked your profile:</h3>
			<div className="block">
				{likerProfiles.length > 0 ? (
					likerProfiles
						.slice(0, 5)
						.map((liker, index) => (
							<LikeProfile key={index} profile={liker} />
						))
				) : (
					<p>Nothing to show yet</p>
				)}
				{likerProfiles.length > 5 ? (
					<Link href="/likesreceived">
						<a className="button is-primary">Show more</a>
					</Link>
				) : null}
			</div>
			<h3 className="title is-3">You liked their profiles:</h3>
			<div className="block">
				{likedProfiles.length > 0 ? (
					likedProfiles
						.slice(0, 5)
						.map((liker, index) => (
							<LikeProfile key={index} profile={liker} />
						))
				) : (
					<p>Nothing to show yet</p>
				)}
				{likedProfiles.length > 5 ? (
					<Link href="/likedprofiles">
						<a className="button is-primary">Show more</a>
					</Link>
				) : null}
			</div>
		</section>
	);
};

export const LikeProfile = ({ profile }: any) => {
	return (
		<Link href={`/profile/${profile.user_id}`}>
			<a>
				<div className="columns card my-6 rounded-corners">
					<div className="column has-text-left is-two-thirds">
						<figure className="image is-square">
							<img
								src={`${authAPI.defaults.baseURL}/images/${profile.profile_image}`}
								alt="Placeholder image"
								crossOrigin=""
								className="rounded-corners"
							/>
							<div className="is-overlay">
								<OnlineIndicator user_id={profile.user_id} />
							</div>
						</figure>
					</div>
					<div className="column mt-3 has-text-left">
						<div className="block">
							<span className="has-text-weight-semibold mr-3">
								Name:
							</span>
							{profile.name}
						</div>
						<div className="block">
							<span className="has-text-weight-semibold mr-3">
								Age:
							</span>
							{profile.birthday &&
								convertBirthdayToAge(profile.birthday)}
						</div>
						<div className="block">
							<span className="has-text-weight-semibold mr-3">
								Famerating:
							</span>
							{profile.famerating}
						</div>

						<div className="block">
							<span className="has-text-weight-semibold mr-3">
								City:
							</span>
							{profile.city}
						</div>
						<div className="block">
							<span className="has-text-weight-semibold mr-3">
								Country:
							</span>
							{profile.country}
						</div>
						<div className="block">
							<span className="has-text-weight-semibold mr-3">
								Interests:
							</span>
							{profile.interests
								? JSON.parse(profile.interests).map(
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
					</div>
				</div>
			</a>
		</Link>
	);
};

const Likes: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="columns is-centered">
				<div className="column is-three-quarters">
					{accessToken ? <LoggedIn /> : <NotLoggedIn />}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Likes;
