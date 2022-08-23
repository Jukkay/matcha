import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';
import {
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
				<div className="block">Age: {profile.birthday && convertBirthdayToAge(profile.birthday)}</div>
				<div className="block">City: {profile.city}</div>
				<div className="block">Country: {profile.country}</div>
			</div>
			</a>
		</Link>
	);
};

const History: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default History;
