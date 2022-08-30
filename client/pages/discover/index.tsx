import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import React, { useState, useEffect } from 'react';
import { Results, Search, SortSelector } from '../../components/discover';
import { useNotificationContext } from '../../components/NotificationContext';

import { useUserContext } from '../../components/UserContext';
import {
	LoadStatus,
	SortType,
	IResultsProfile,
	ActivePage,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { convertBirthdayToAge } from '../../utilities/helpers';
import {
	farFirst,
	highFameratingFirst,
	lessCommonTagsFirst,
	lowFameratingFirst,
	moreCommonTagsFirst,
	nearFirst,
	oldFirst,
	youngFirst,
} from '../../utilities/sort';

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
	const { profile, setProfile, userData, updateUserData } = useUserContext();
	const { setActivePage } = useNotificationContext()
	const [sort, setSort] = useState<SortType>(SortType.DISTANCE);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [searchParams, setSearchParams] = useState({
		gender: profile.gender,
		looking: profile.looking,
		min_age: profile.min_age || (convertBirthdayToAge(profile.birthday) - 5),
		max_age: profile.max_age || (convertBirthdayToAge(profile.birthday) + 5),
		min_famerating: 1,
		max_famerating: 1000,
		max_distance: 1000
	});
	const [results, setResults] = useState<IResultsProfile[]>([]);
	const router = useRouter();
	if (!userData.profile_exists) router.replace('/profile');

	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({ ...profile, geolocation: position }),
				(error) =>
					console.log('Geolocation not permitted by user.', error)
			);
		}
		setActivePage(ActivePage.DISCOVER)
	}, []);

	useEffect(() => {
		if (results.length < 1) return;
		if (sort === SortType.DISTANCE)
			setResults(nearFirst(results, profile.latitude, profile.longitude));
		if (sort === SortType.REVERSE_DISTANCE)
			setResults(farFirst(results, profile.latitude, profile.longitude));
		if (sort === SortType.AGE) setResults(youngFirst(results));
		if (sort === SortType.REVERSE_AGE) setResults(oldFirst(results));
		if (sort === SortType.TAGS) setResults(moreCommonTagsFirst(results));
		if (sort === SortType.REVERSE_TAGS)
			setResults(lessCommonTagsFirst(results));
		if (sort === SortType.FAMERATING)
			setResults(highFameratingFirst(results));
		if (sort === SortType.REVERSE_FAMERATING)
			setResults(lowFameratingFirst(results));
	}, [sort]);

	useEffect(() => {
		if (searchParams.max_distance < 1) return;
		const filteredByMaxDistance = [...results].filter((item) => item.distance <= searchParams.max_distance * 1000);
		setResults(filteredByMaxDistance);
	}, [searchParams.max_distance]);

	return (
		<>
			<Search
				searchParams={searchParams}
				setSearchParams={setSearchParams}
				setResults={setResults}
			/>
			<SortSelector sort={sort} setSort={setSort} />
			<Results
				results={results as IResultsProfile[]}
				setResults={setResults}
			/>
		</>
	);
};

const Discover: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-three-quarters mt-6 pt-6">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Discover;
