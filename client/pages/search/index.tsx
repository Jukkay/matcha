import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import React, { useState, useEffect, useRef } from 'react';
import { Results, ProfileSearch } from '../../components/search';
import { useNotificationContext } from '../../components/NotificationContext';

import { useUserContext } from '../../components/UserContext';
import {
	LoadStatus,
	SortType,
	IResultsProfile,
	ActivePage,
} from '../../types/types';
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
	const { setActivePage } = useNotificationContext();
	const [sort, setSort] = useState<SortType>(SortType.DISTANCE);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [searchParams, setSearchParams] = useState({
		gender: profile.gender,
		looking: profile.looking,
		country: '',
		city: '',
		min_age: profile.min_age || convertBirthdayToAge(profile.birthday) - 5,
		max_age: profile.max_age || convertBirthdayToAge(profile.birthday) + 5,
		min_famerating: 1,
		max_famerating: 1000,
		max_distance: 0,
	});
	const [results, setResults] = useState<IResultsProfile[]>([]);
	const [filteredResults, setFilteredResults] = useState<IResultsProfile[]>(
		[]
	);
	const [sortedResults, setSortedResults] = useState<IResultsProfile[]>(
		[]
	);
	const [wasRedirected, setWasRedirected] = useState(false);
	const isFirstRender = useRef(true)
	const router = useRouter();

	// Redirect if user has no profile
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
    	router.replace('/profile')
	}, [userData.profile_exists]);
	
	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({ ...profile, geolocation: position }),
				(error) =>
					console.log('Geolocation not permitted by user.', error)
			);
		}
		setActivePage(ActivePage.DISCOVER);
	}, []);

	useEffect(() => {
		if (sort === SortType.DISTANCE)
			setSortedResults(nearFirst(filteredResults));
		if (sort === SortType.REVERSE_DISTANCE)
			setSortedResults(farFirst(filteredResults));
		if (sort === SortType.AGE)
			setSortedResults(youngFirst(filteredResults));
		if (sort === SortType.REVERSE_AGE)
			setSortedResults(oldFirst(filteredResults));
		if (sort === SortType.TAGS)
			setSortedResults(moreCommonTagsFirst(filteredResults));
		if (sort === SortType.REVERSE_TAGS)
			setSortedResults(lessCommonTagsFirst(filteredResults));
		if (sort === SortType.FAMERATING)
			setSortedResults(highFameratingFirst(filteredResults));
		if (sort === SortType.REVERSE_FAMERATING)
			setSortedResults(lowFameratingFirst(filteredResults));
	}, [
		sort,
		searchParams.min_famerating,
		searchParams.max_famerating,
		searchParams.max_distance,
		searchParams.country,
		searchParams.city,
		filteredResults
	]);

	return (
		<>
			<ProfileSearch
				searchParams={searchParams}
				setSearchParams={setSearchParams}
				setResults={setResults}
				results={results}
				filteredResults={filteredResults}
				setFilteredResults={setFilteredResults}
				setLoadStatus={setLoadStatus}
				sort={sort} 
				setSort={setSort}
			/>
			<Results sortedResults={sortedResults} loadStatus={loadStatus} />
		</>
	);
};

const Search: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-three-quarters mt-6 pt-6">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Search;
