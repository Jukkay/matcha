import type { NextPage } from 'next';

import React, { useState, useEffect } from 'react';
import { Results, Search } from '../../components/discover';

import { useUserContext } from '../../components/UserContext';
import { IProfileCard, LoadStatus, LocationType, SortType, IProfile } from '../../types/types';

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
	const [location, setLocation] = useState<LocationType>(LocationType.GEOLOCATION)
	const [sort, setSort] = useState<SortType>(SortType.LOCATION)
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE)
	const [searchParams, setSearchParams] = useState({
		gender: profile.gender,
		looking: profile.looking,
		min_age: profile.min_age,
		max_age: profile.max_age,
	});
	const [results, setResults] = useState<IProfile[]>([]);
	const sortByDistance = () => {
		let resultsSortedByDistance
		// Set location type to the most accurate or user-defined
		if (profile.ip_location) {
			setLocation(LocationType.IP)
		}
		if (profile.geolocation) {
			setLocation(LocationType.GEOLOCATION)
		}
		if (profile.latitude && profile.longitude) {
			setLocation(LocationType.USER)
		}

		if (location === LocationType.GEOLOCATION) {
			// resultsSortedByDistance = [...results].sort((a, b) => a - b)
		}
	}
	const sortByAge = () => {
		
	}
	const sortByCommonTags = () => {
		
	}
	const sortByFamerating = () => {
		
	}
	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({...profile, geolocation: position}), 
				(error) => console.log('Geolocation not permitted by user.', error))
		}
	}, []);

	useEffect(() => {
		if (sort === SortType.LOCATION) sortByDistance()
		if (sort === SortType.AGE) sortByAge()
		if (sort === SortType.TAGS) sortByCommonTags()
		if (sort === SortType.FAMERATING) sortByFamerating()
	}, [sort, results])

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
