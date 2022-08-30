import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { GenderSelector, OnlineIndicator, SearchAgeRange } from './profile';
import { useUserContext } from './UserContext';
import {
	AgeRangeProps,
	IProfileCard,
	OtherUserViewProps,
	ResultsProps,
	SearchProps,
	SortProps,
	SortType,
} from '../types/types';
import { authAPI } from '../utilities/api';
import {
	addCommonTagsToProfiles,
	addDistanceToProfiles,
	convertAgeToBirthday,
	convertBirthdayToAge,
} from '../utilities/helpers';
import { nearFirst } from '../utilities/sort';

export const Search = ({
	searchParams,
	setSearchParams,
	setResults,
}: SearchProps) => {
	const { profile } = useUserContext();
	const searchDatabase = async () => {
		const query = {
			gender: searchParams.gender,
			looking: searchParams.looking,
			min_age: searchParams.min_age,
			max_age: searchParams.max_age,
			min_famerating: searchParams.min_famerating,
			max_famerating: searchParams.max_famerating,
		};
		try {
			let response = await authAPI.post(`/search`, {
				search: query,
			});
			if (response?.data?.results) {
				// Calculate distances
				const resultsWithDistance = addDistanceToProfiles(
					response.data.results,
					profile.latitude,
					profile.longitude
				);
				// Count common interests
				const resultsWithTags = addCommonTagsToProfiles(
					resultsWithDistance,
					profile.interests
				);
				// Default sort by distance
				const sortedResults = nearFirst(
					resultsWithTags,
					profile.latitude,
					profile.longitude
				);
				setResults(sortedResults);
			}
		} catch (err) {
			console.error(err);
		}
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
				<FameratingRange
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<DistanceRange
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

const FameratingRange = ({ searchParams, setSearchParams }: AgeRangeProps) => {
	return (
		<div className="block">
			<label htmlFor="min_age" className="label">
				Famerating range *
			</label>

			<div className="field is-horizontal">
				<div className="field-label is-normal">
					<label htmlFor="min_famerating" className="label">
						Min
					</label>
				</div>
				<div className="field-body">
					<div className="field">
						<input
							type="number"
							id="min_famerating"
							className="input is-primary"
							min="1"
							max={searchParams.max_famerating}
							value={searchParams.min_famerating}
							onChange={(event) =>
								setSearchParams({
									...searchParams,
									min_famerating: parseInt(
										event.target.value
									),
								})
							}
						/>
					</div>
					<div className="field-label is-normal">
						<label htmlFor="max_famerating" className="label">
							Max
						</label>
					</div>
					<div className="field">
						<input
							type="number"
							id="max_famerating"
							className="input is-primary"
							min={searchParams.min_famerating}
							max="1000"
							value={searchParams.max_famerating}
							onChange={(event) =>
								setSearchParams({
									...searchParams,
									max_famerating: parseInt(
										event.target.value
									),
								})
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const DistanceRange = ({ searchParams, setSearchParams }: AgeRangeProps) => {
	return (
		<div className="block">
			<label htmlFor="max_distance" className="label my-3">
				Maximum distance (km)
			</label>
			<div className="field">
				<input
					type="number"
					id="max_distance"
					className="input is-primary"
					min={1}
					value={searchParams.max_distance}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							max_distance: parseInt(event.target.value),
						})
					}
				/>
			</div>
		</div>
	);
};

export const Results = ({ results }: ResultsProps) => {
	return results.length > 0 ? (
		<section className="section has-text-centered">
			{results?.map((result, index) => (
				<SearchResultItem
					key={index}
					user_id={result.user_id}
					profile_image={result.profile_image}
					name={result.name}
					birthday={result.birthday}
					city={result.city}
					country={result.country}
					distance={result.distance}
					famerating={result.famerating}
					interests={result.interests}
					online={result.online}
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
	famerating,
	distance,
	interests,
	online,
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
					<OnlineIndicator onlineStatus={online}/>
					<div className="block">Name: {name}</div>
					<div className="block">
						Age: {birthday && convertBirthdayToAge(birthday)}
					</div>
					<div className="block">Famerating: {famerating}</div>
					<div className="block">Distance: {`${distance} km`}</div>
					<div className="block">City: {city}</div>
					<div className="block">Country: {country}</div>
					<div className="block">
						Interests:{' '}
						{interests
							? Object.entries(JSON.parse(interests)).map(
									(interest, index) => (
										<span
											className="tag is-success is-medium is-rounded is-clickable mx-2 my-1"
											key={index}
										>
											{interest[1] as string}
										</span>
									)
							  )
							: null}
					</div>
				</div>
			</a>
		</Link>
	);
};

export const SortSelector = ({ sort, setSort }: SortProps) => {
	return (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				Sort by
			</label>
			<div className="select">
				<select
					id="city"
					name="city"
					value={sort}
					onChange={(event) => setSort(event.target.value)}
				>
					<option value={SortType.DISTANCE}>
						Distance (near to far)
					</option>
					<option value={SortType.REVERSE_DISTANCE}>
						Distance (far to near)
					</option>
					<option value={SortType.AGE}>Age (younger first)</option>
					<option value={SortType.REVERSE_AGE}>
						Age (older first)
					</option>
					<option value={SortType.TAGS}>
						Common interests (more first)
					</option>
					<option value={SortType.REVERSE_TAGS}>
						Common interests (less first)
					</option>
					<option value={SortType.FAMERATING}>
						Famerating high to low
					</option>
					<option value={SortType.REVERSE_FAMERATING}>
						Famerating low to high
					</option>
				</select>
			</div>
		</div>
	);
};
