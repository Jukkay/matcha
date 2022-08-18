import type { NextPage } from 'next';

import React, { useState, useEffect } from 'react';
import { Results, Search } from '../../components/discover';

import { useUserContext } from '../../components/UserContext';
import {
	IProfileCard,
	LoadStatus,
	LocationType,
	SortType,
	IProfile,
} from '../../types/types';
import { distanceBetweenPoints } from '../../utilities/helpers';

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
	const { profile, setProfile } = useUserContext();
	const [location, setLocation] = useState<LocationType>(
		LocationType.GEOLOCATION
	);
	const [sort, setSort] = useState<SortType>(SortType.LOCATION);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [searchParams, setSearchParams] = useState({
		gender: profile.gender,
		looking: profile.looking,
		min_age: profile.min_age,
		max_age: profile.max_age,
	});
	const [results, setResults] = useState<IProfile[]>([]);

	const sortByDistance = () => {
		const mappedResults = results.map((item, index) => {
			return {
				index,
				distance: distanceBetweenPoints(
					profile.latitude,
					profile.longitude,
					item.latitude as string,
					item.longitude as string
				),
			};
		});
		mappedResults.sort((a, b) => a.distance - b.distance);
		const sortedResults = mappedResults.map(
			(item) => results[item.distance]
		);
		console.log(sortedResults);
		setResults(sortedResults)
	};
	const sortByAge = () => {};
	const sortByCommonTags = () => {};
	const sortByFamerating = () => {};
	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({ ...profile, geolocation: position }),
				(error) =>
					console.log('Geolocation not permitted by user.', error)
			);
		}
	}, []);

	useEffect(() => {
		if (sort === SortType.LOCATION) sortByDistance();
		if (sort === SortType.AGE) sortByAge();
		if (sort === SortType.TAGS) sortByCommonTags();
		if (sort === SortType.FAMERATING) sortByFamerating();
	}, [sort]);

	return (
		<>
			<Search
				searchParams={searchParams}
				setSearchParams={setSearchParams}
				setResults={setResults}
			/>
			<Results results={results} setResults={setResults} />
		</>
	);
};

const Discover: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Discover;
