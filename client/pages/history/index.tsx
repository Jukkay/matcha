import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import { OnlineIndicator } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { ErrorBoundary, LoadError, Spinner } from '../../components/utilities';
import { ActivePage, LoadStatus, LogEntry } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { convertBirthdayToAge } from '../../utilities/helpers';

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
	const { setActivePage } = useNotificationContext();
	const [log, setLog] = useState([]);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [wasRedirected, setWasRedirected] = useState(false);
	const isFirstRender = useRef(true);
	const router = useRouter();

	// Redirect if user has no profile
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
		router.replace('/profile');
	}, [userData.profile_exists]);

	useEffect(() => {
		const getVisitorLog = async () => {
			try {
				setLoadStatus(LoadStatus.LOADING);
				let response = await authAPI.get(`/log`);
				if (response.status === 200) {
					setLog(response.data.log);
				}
			} catch (err) {
				console.error(err);
				setLoadStatus(LoadStatus.ERROR);
			} finally {
				setLoadStatus(LoadStatus.IDLE);
			}
		};
		getVisitorLog();
		setActivePage(ActivePage.HISTORY);
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

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading history" />;

	return log.length > 0 ? (
		<section className="section has-text-centered">
			<h3 className="title is-3">Recently visited profiles</h3>
			<div className="block">
				{log.map((visitor: LogEntry, index) => (
					<SearchResultItem key={index} profile={visitor} />
				))}
			</div>
		</section>
	) : (
		<section className="section">
			<h3 className="title is-3">Recently visited profiles</h3>
			<div className="block">No visits yet</div>
		</section>
	);
};

export const SearchResultItem = ({ profile }: any) => {
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

const History: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<ErrorBoundary>
			<div className="columns is-centered">
				<div className="column is-three-quarters">
					{accessToken ? <LoggedIn /> : <NotLoggedIn />}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default History;
