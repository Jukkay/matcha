import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import {
	GenderSelector,
	SearchAgeRange,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import {
	OtherUserViewProps,
	ResultsProps,
	SearchProps,
} from '../../types/types';
import { authAPI } from '../../utilities/api';
import { convertAgeToBirthday, convertBirthdayToAge } from '../../utilities/helpers';

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
	const [results, setResults] = useState([]);

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

const Search = ({ searchParams, setSearchParams, setResults }: SearchProps) => {
	const searchDatabase = async () => {
		const query = {
			gender: searchParams.gender,
			looking: searchParams.looking,
			min_age: searchParams.min_age,
			max_age: searchParams.max_age
		}
		let response = await authAPI.post(`/search`, {
			search: query,
		});
		console.log(response.data.results);
		if (response?.data?.results) {
			setResults(response.data.results);
		}
		else
			setResults([])
	};

	useEffect(() => {
		searchDatabase();
	}, []);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		searchDatabase();
	};

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
							looking: event.target.value,
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

	return results.length > 0 ? (
		<section className="section has-text-centered">
			{results.map((result) => (
				<SearchResultItem profile={result} />
			))}
		</section>
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No matching profiles found</h3>
		</section>
	);
};

const SearchResultItem = ({ profile }: OtherUserViewProps) => {
	return (
		<div>
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
		</div>
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
