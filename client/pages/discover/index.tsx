import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import {
	AgeRange,
	Gallery,
	GenderSelector,
	SearchAgeRange,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import {
	IOtherUser,
	OtherUserViewProps,
	ResultsProps,
	SearchProps,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { FcLike } from 'react-icons/fc';

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
		gender: profile.looking,
		min_age: profile.min_age,
		max_age: profile.max_age,
	});
	const [results, setResults] = useState({});

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

const Search = ({ searchParams, setSearchParams }: SearchProps) => {

	const searchDatabase = async () => {
		let response = await authAPI.post(`/search`, {
			search: searchParams,
		});
	};

	useEffect(() => {
		searchDatabase();
	}, []);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		searchDatabase();
	}

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<SearchAgeRange
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<GenderSelector
					label="Gender *"
					id="looking"
					value={searchParams.gender}
					placeholder="Choose a gender"
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							gender: event.target.value,
						})
					}
					options={[
						'Male',
						'Female',
						'Non-binary',
						'Trans-man',
						'Trans-woman',
						'Other',
					]}
				/>
				<button type="submit" className="button is-primary">
					Search
				</button>
			</form>
		</div>
	);
};

const Results = ({ results }: ResultsProps) => {
	const { userData } = useUserContext();

	return (
		<section className="section has-text-centered">
			<h3 className="title is-3">No matching profiles found</h3>
		</section>
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