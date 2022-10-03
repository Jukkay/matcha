import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import { useUserContext } from '../../components/UserContext';
import { ErrorFallback, LoadError, Spinner } from '../../components/utilities';
import { ActivePage, LoadStatus, LogEntry } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { handleRouteError } from '../../utilities/helpers';
import { useInView } from 'react-intersection-observer';
import { ErrorBoundary } from 'react-error-boundary';
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
	const { setActivePage } = useNotificationContext();
	const [log, setLog] = useState([]);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();
	const [endIndex, setEndIndex] = useState(9);

	// Infinite scroll hooks
	const { ref, inView } = useInView({
		threshold: 0,
	});

	useEffect(() => {
		if (inView) {
			setEndIndex((endIndex) => endIndex + 10);
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

	useEffect(() => {
		const controller = new AbortController();
		const getVisitorLog = async () => {
			try {
				setLoadStatus(LoadStatus.LOADING);
				let response = await authAPI.get(`/log`, {
					signal: controller.signal,
				});
				if (response.status === 200) {
					setLog(response.data.log);
				}
			} catch (err) {
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		getVisitorLog();
		setActivePage(ActivePage.HISTORY);
		return () => controller.abort();
	}, []);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading history" />;

	return log.length > 0 ? (
		<div className="my-6">
			<h1 className="title is-1">Recently visited profiles</h1>
			{log.slice(0, endIndex).map((visitor: LogEntry, index) => (
				<SearchResultItemWithoutDistance
					key={index}
					profile={visitor}
				/>
			))}
			{endIndex < log.length ? (
				<div ref={ref}>
					<Spinner />
				</div>
			) : (
				<section className="section has-text-centered">
					<h3 className="title is-3">No more matching profiles</h3>
				</section>
			)}
		</div>
	) : (
		<section className="section">
			<h3 className="title is-3">Recently visited profiles</h3>
			<div className="block">No visits yet</div>
		</section>
	);
};

const History: NextPage = () => {
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

export default History;
