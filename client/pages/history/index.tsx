import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import { OnlineIndicator } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import {
	ActivePage,
    LogEntry,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import {  convertBirthdayToAge } from '../../utilities/helpers';

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
	const { setActivePage } = useNotificationContext()
    const [log, setLog] = useState([])
	const router = useRouter();
	if (!userData.profile_exists) router.replace('/profile');
	
	useEffect(() => {
		const getVisitorLog = async () => {
			let response = await authAPI.get(`/log`);
			if (response.status === 200) {
				console.log(response.data.log)
				setLog(response.data.log)
			}
		}
		getVisitorLog();
		setActivePage(ActivePage.HISTORY)
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

	return log.length > 0 ? (
		<section className="section has-text-centered">
			<h3 className="title is-3">Recently visited profiles</h3>
				<div className="block">
					{log.map((visitor: LogEntry, index) => <SearchResultItem profile={visitor}/>)}
				</div>
	
			</section>
	) : (
	<section className="section">
	<h3 className="title is-3">Recently visited profiles</h3>
		<div className="block">No visits yet</div>

	</section>)
};

const SearchResultItem = ({ profile }: any) => {
	return (
<Link href={`/profile/${profile.user_id}`}>
			<a>
				<div className="columns card my-6">
					<div className="column card-image has-text-left is-two-thirds">
						<figure className="image">
							<img
								src={`${authAPI.defaults.baseURL}/images/${profile.profile_image}`}
								alt="Placeholder image"
								crossOrigin=""
							/>
						</figure>
						<div className="is-overlay card-content">
							<OnlineIndicator onlineStatus={profile.online} />
						</div>
					</div>
					<div className="column mt-3 has-text-left">
						<div className="block">Name: {profile.name}</div>
						<div className="block">
							Age: {profile.birthday && convertBirthdayToAge(profile.birthday)}
						</div>
						<div className="block">Famerating: {profile.famerating}</div>
						<div className="block">
							Distance: {`${profile.distance} km`}
						</div>
						<div className="block">City: {profile.city}</div>
						<div className="block">Country: {profile.country}</div>
						<div className="block">
							Interests:{' '}
							{profile.interests
								? Object.entries(JSON.parse(profile.interests)).map(
										(interest, index) => (
											<span
												className="tag is-primary mx-2 my-1"
												key={index}
											>
												{interest[1] as string}
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
		<div className="columns is-centered">
			<div className="column is-three-quarters">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default History;
