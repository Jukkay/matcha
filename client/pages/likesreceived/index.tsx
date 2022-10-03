import type { NextPage } from 'next';
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
import { useInView } from 'react-intersection-observer';
import { ErrorBoundary } from 'react-error-boundary';
import { handleRouteError } from '../../utilities/helpers';
import { SearchResultItemWithoutDistance } from '../../components/profileCards';

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
	const [likerProfiles, setLikerProfiles] = useState<ILikeProfile[]>([]);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();
	const [endIndex, setEndIndex] = useState(5);

	// Infinite scroll hooks
	const { ref, inView } = useInView({
		threshold: 0,
	});

	useEffect(() => {
		if (inView) {
			setEndIndex((endIndex) => endIndex + 5);
		}
	}, [inView]);

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

	const getLikerProfiles = async (controller: AbortController) => {
		let response = await authAPI.get(`/like/${userData.user_id}`, {
			signal: controller.signal,
		});
		if (response.data.profiles.length > 0) {
			setLikerProfiles(response.data.profiles);
		}
	};

	const markLikeNotificationsRead = async (controller: AbortController) => {
		const response = await authAPI.patch('/notifications', {
			type: NotificationType.LIKE,
			user_id: userData.user_id,
			signal: controller.signal,
		});
		if (response.status === 200) {
			setNotificationCount(0);
			setMessageCount(0);
			setLikeCount(0);
		}
	};

	useEffect(() => {
		if (!userData.user_id) return;
		const controller1 = new AbortController();
		const controller2 = new AbortController();
		const fetchData = async () => {
			try {
				setLoadStatus(LoadStatus.LOADING);
				await getLikerProfiles(controller1);
				await markLikeNotificationsRead(controller2);
			} catch (err) {
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		fetchData();
		setActivePage(ActivePage.LIKES);
		return () => {
			controller1.abort();
			controller2.abort();
		};
	}, [userData.user_id]);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading likes" />;

	return likerProfiles.length > 0 ? (
		<section className="section has-text-centered">
			<h3 className="title is-3">They liked your profile:</h3>
			<div className="block">
				{likerProfiles.slice(0, endIndex).map((liker, index) => (
					<SearchResultItemWithoutDistance
						key={index}
						profile={liker}
					/>
				))}
				{endIndex < likerProfiles.length ? (
					<div ref={ref}>
						<Spinner />
					</div>
				) : (
					<section className="section has-text-centered">
						<h3 className="title is-3">
							No more matching profiles
						</h3>
					</section>
				)}
			</div>
		</section>
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No likes to show yet</h3>
		</section>
	);
};

const LikesReceived: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="columns is-centered is-gapless">
				<div className="column is-three-quarters">
					{accessToken ? <LoggedIn /> : <NotLoggedIn />}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default LikesReceived;
