import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import { useUserContext } from '../../components/UserContext';
import { ErrorFallback, LoadError, Spinner } from '../../components/utilities';
import {
	ActivePage,
	ILikeProfile,
	LoadStatus,
	NotificationType,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { handleRouteError } from '../../utilities/helpers';
import { ErrorBoundary } from 'react-error-boundary';
import { SearchResultItemWithoutDistance } from '../../components/profileCards';
import { LandingPage } from '../../components/landingPage';

const LoggedIn = () => {
	const { userData } = useUserContext();
	const { setActivePage, setLikeCount, setActiveChatUser } =
		useNotificationContext();
	const [likedProfiles, setLikedProfiles] = useState<ILikeProfile[]>([]);
	const [likerProfiles, setLikerProfiles] = useState<ILikeProfile[]>([]);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
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

	const queryAPI = async (
		controller1: AbortController,
		controller2: AbortController,
		controller3: AbortController
	) => {
			const promises = [
				authAPI.patch('/notifications', {
					type: NotificationType.LIKE,
					user_id: userData.user_id,
					signal: controller1.signal,
				}),
				authAPI.get(`/like/${userData.user_id}`, {
					signal: controller2.signal,
				}),
				authAPI.get(`/likedprofiles/${userData.user_id}`, {
					signal: controller3.signal,
				}),
			];
			Promise.all(promises).then((responses) => {
				if (responses[0].status === 200) {
					setLikeCount(0);
				}
				if (responses[1].data?.profiles?.length > 0) {
					setLikerProfiles(responses[1].data.profiles);
				}
				if (responses[2].data?.profiles?.length > 0) {
					setLikedProfiles(responses[2].data.profiles);
				}
			}).catch((error) => error);
	};
	useEffect(() => {
		if (!userData.user_id) return;
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const controller3 = new AbortController();
		const fetchData = async () => {
			try {
				setLoadStatus(LoadStatus.LOADING);
				// Must do this in its own function and promise.all to avoid 204s stopping execution
				await queryAPI(controller1, controller2, controller3);
			} catch (err) {
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		setActivePage(ActivePage.LIKES);
		setActiveChatUser(0);
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
		<div className="my-6 pt-6">
			<h1 className="title is-1">Likes</h1>
			<h4 className="title is-4">They liked your profile:</h4>
			<div className="block">
				{likerProfiles.length > 0 ? (
					likerProfiles
						.slice(0, 5)
						.map((liker, index) => (
							<SearchResultItemWithoutDistance
								key={index}
								profile={liker}
							/>
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
			<h4 className="title is-4">You liked their profiles:</h4>
			<div className="block">
				{likedProfiles.length > 0 ? (
					likedProfiles
						.slice(0, 5)
						.map((liker, index) => (
							<SearchResultItemWithoutDistance
								key={index}
								profile={liker}
							/>
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
		</div>
	);
};

const Likes: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="columns is-centered is-gapless">
				<div className="column is-three-quarters">
					{accessToken ? <LoggedIn /> : <LandingPage />}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Likes;
