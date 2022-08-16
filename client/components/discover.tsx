import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { GenderSelector, SearchAgeRange } from './profile';
import { useUserContext } from './UserContext';
import {
	IProfileCard,
	OtherUserViewProps,
	ResultsProps,
	SearchProps,
} from '../types/types';
import { authAPI } from '../utilities/api';
import {
	convertAgeToBirthday,
	convertBirthdayToAge,
} from '../utilities/helpers';

export const Search = ({
	searchParams,
	setSearchParams,
	setResults,
}: SearchProps) => {
	const searchDatabase = async () => {
		const query = {
			gender: searchParams.gender,
			looking: searchParams.looking,
			min_age: searchParams.min_age,
			max_age: searchParams.max_age,
		};
		let response = await authAPI.post(`/search`, {
			search: query,
		});
		console.log(response.data.results);
		if (response?.data?.results) {
			setResults(response.data.results);
		} else setResults([]);
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
					value={searchParams.looking}
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

export const Results = ({ results }: ResultsProps) => {
	const { userData } = useUserContext();

	return results.length > 0 ? (
		<section className="section has-text-centered">
			{results.map((result) => (
				<SearchResultItem
					user_id={result.user_id}
					profile_image={result.profile_image}
					name={result.name}
					birthday={result.birthday}
					city={result.city}
					country={result.country}
				/>
			))}
		</section>
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No matching profiles found</h3>
		</section>
	);
};

export const SearchResultItem = ({
	user_id,
	profile_image,
	name,
	birthday,
	city,
	country,
}: IProfileCard) => {
	return (
		<Link href={`/profile/${user_id}`}>
			<a>
				<div className="card">
					<div className="p-3 has-text-centered">
						<figure className="image is-128x128">
							<img
								src={`${authAPI.defaults.baseURL}/images/${profile_image}`}
								alt="Placeholder image"
								crossOrigin=""
							/>
						</figure>
					</div>
					<div className="block">Name: {name}</div>
					<div className="block">
						Age: {birthday && convertBirthdayToAge(birthday)}
					</div>
					<div className="block">City: {city}</div>
					<div className="block">Country: {country}</div>
				</div>
			</a>
		</Link>
	);
};
