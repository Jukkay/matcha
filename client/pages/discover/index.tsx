import type { NextPage } from 'next';

import React, { useState, useEffect } from 'react';
import { Results, Search } from '../../components/discover';

import { useUserContext } from '../../components/UserContext';
import { IProfileCard } from '../../types/types';

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
	const { profile } = useUserContext();
	const [searchParams, setSearchParams] = useState({
		gender: profile.gender,
		looking: profile.looking,
		min_age: profile.min_age,
		max_age: profile.max_age,
	});
	const [results, setResults] = useState<IProfileCard[]>([]);

	return (
		<>
			<Search
				searchParams={searchParams}
				setSearchParams={setSearchParams}
				results={results}
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
