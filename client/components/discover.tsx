import type { NextPage } from 'next';
import Link from 'next/link';
import React, {
	useState,
	useEffect,
	useCallback,
	MutableRefObject,
	useRef,
} from 'react';
import {
	GenderSelector,
	OnlineIndicator,
	SearchAgeRange,
	SearchResult,
} from './profile';
import { useUserContext } from './UserContext';
import {
	AdvancedSearchProps,
	IProfileCard,
	IResultsProfile,
	LoadStatus,
	ResultsProps,
	SearchParamsProps,
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
import { moreCommonTagsFirst } from '../utilities/sort';
import { Country, City } from 'country-state-city';
import { ErrorMessage } from './form';
import { dummyData } from '../pages/profile/data';

export const Search = ({
	searchParams,
	setSearchParams,
	setResults,
	results,
	filteredResults,
	setFilteredResults,
	setLoadStatus,
}: SearchProps) => {
	const { profile } = useUserContext();
	const [interests, setInterests] = useState<string[]>([]);

	const searchDatabase = async () => {
		const query = {
			gender: searchParams.gender,
			looking: searchParams.looking,
			min_age: searchParams.min_age,
			max_age: searchParams.max_age,
			country: searchParams.country,
			city: searchParams.city,
		};
		try {
			setLoadStatus(LoadStatus.LOADING);
			let response = await authAPI.post(`/search`, {
				data: query,
			});
			if (response?.data?.results) {
				// Calculate distances
				const resultsWithDistance = addDistanceToProfiles(
					response.data.results,
					profile.user_latitude
						? profile.user_latitude
						: profile.latitude,
					profile.user_longitude
						? profile.user_longitude
						: profile.longitude
				);
				// Count common interests
				const resultsWithTags = addCommonTagsToProfiles(
					resultsWithDistance,
					profile.interests
				);
				const resultsSortedByInterests =
					moreCommonTagsFirst(resultsWithTags);
				setResults(resultsSortedByInterests);
				setFilteredResults(resultsSortedByInterests);
			} else {
				setResults([]);
				setFilteredResults([]);
			}
		} catch (err) {
			setLoadStatus(LoadStatus.ERROR);
			console.error(err);
		} finally {
			setLoadStatus(LoadStatus.IDLE);
		}
	};

	useEffect(() => {
		searchDatabase();
	}, []);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		searchDatabase();
	};
	const resetSearch = (event: React.FormEvent) => {
		event.preventDefault();
		setSearchParams({
			gender: profile.gender,
			looking: profile.looking,
			country: '',
			city: '',
			min_age:
				profile.min_age || convertBirthdayToAge(profile.birthday) - 5,
			max_age:
				profile.max_age || convertBirthdayToAge(profile.birthday) + 5,
			min_famerating: 1,
			max_famerating: 1000,
			max_distance: 0,
		});
		setInterests([]);
		setFilteredResults(results);
	};
	return (
		<div>
			<h3 className="title is-3">Search</h3>
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
						'Male or Female',
						'Non-binary',
						'Trans-man',
						'Trans-woman',
						'Anything goes',
					]}
				/>
				<hr />
				<h5 className="title is-5 has-text-grey">Optional</h5>
				<CountrySearchSelector
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<CitySearchSelector
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<div className="buttons">
					<button type="submit" className="button is-primary">
						Search
					</button>
					<button
						type="submit"
						onClick={resetSearch}
						className="button"
					>
						Reset to default
					</button>
				</div>
				<hr />
				<h5 className="title is-5 has-text-grey">Filter results</h5>
				<AdvancedSearch
					searchParams={searchParams}
					setSearchParams={setSearchParams}
					interests={interests}
					setInterests={setInterests}
					results={results}
					setFilteredResults={setFilteredResults}
				/>
				<hr />
			</form>
		</div>
	);
};

const AdvancedSearch = ({
	searchParams,
	setSearchParams,
	interests,
	setInterests,
	results,
	setFilteredResults,
}: AdvancedSearchProps) => {
	const [visible, setVisible] = useState(false);

	const onClick = () => setVisible((visible) => !visible);

	const handleFilters = (event: React.FormEvent) => {
		event.preventDefault();
		let filteredResults = results;

		// Filter by distance
		if (searchParams.max_distance > 0) {
			console.log('Filtering by distance', searchParams.max_distance);
			filteredResults = [...filteredResults].filter(
				(item) => item.distance <= searchParams.max_distance
			);
		}
		// Filter by interests
		if (interests.length > 0) {
			filteredResults = filteredResults.filter((item) => {
				return JSON.parse(item.interests).some((data: string) =>
					interests.includes(data)
				);
			});
		}
		// Filter by famerating
		if (searchParams.min_famerating > 0) {
			filteredResults = [...filteredResults].filter(
				(item) =>
					item.famerating >= searchParams.min_famerating &&
					item.famerating <= searchParams.max_famerating
			);
		}
		setFilteredResults(filteredResults);
	};

	return visible ? (
		<div className="block">
			<div className="block">
				<button className="button is-primary" onClick={onClick}>
					Hide filters
				</button>
			</div>
			<div className="block">
				<FameratingRange
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
			</div>
			<div className="block">
				<DistanceRange
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<Interests interests={interests} setInterests={setInterests} />
			</div>
			<div className="block">
				<button className="button is-primary" onClick={handleFilters}>
					Apply filters
				</button>
			</div>
		</div>
	) : (
		<div className="block">
			<button className="button is-primary" onClick={onClick}>
				Show filters
			</button>
		</div>
	);
};
const Interests = ({ interests, setInterests }: any) => {
	const [tagError, setTagError] = useState(false);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	// Live query interest from interest list
	useEffect(() => {
		if (!query) {
			setResult([]);
			return;
		}
		const results = dummyData.filter((interest) =>
			interest.toLowerCase().includes(query.toLowerCase())
		);
		setResult(results);
	}, [query]);

	return (
		<div className="block">
			<label htmlFor="interests" className="label my-3">
				Interests (choose 1 to 5) *
			</label>
			<input
				className="input my-3"
				type="text"
				id="interests"
				placeholder="Search for interests"
				onChange={onChange}
			></input>
			<ErrorMessage
				errorMessage="Maximum 5 interests. Please unselect something to select something new."
				error={tagError}
			/>
			<SearchResult
				result={result}
				setResult={setResult}
				setTagError={setTagError}
				interests={interests}
				setInterests={setInterests}
				query={query}
			/>
		</div>
	);
};
const FameratingRange = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return (
		<div className="block">
			<label htmlFor="min_age" className="label">
				Famerating range
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

const DistanceRange = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
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
					value={searchParams.max_distance}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							max_distance: event.target.value,
						})
					}
				/>
			</div>
		</div>
	);
};

export const Results = ({ sortedResults, loadStatus }: ResultsProps) => {
	const [endIndex, setEndIndex] = useState(9);
	const [searchResultText, setSearchResultText] = useState('');
	const scrollTarget: MutableRefObject<any> = useRef(null);

	// Infinite scroll for results
	const handleScroll = useCallback((entries: any) => {
		if (entries[0].isIntersecting) {
			setEndIndex((endIndex) => endIndex + 10);
		}
	}, []);

	useEffect(() => {
		const options = {
			root: null,
			threshold: 1.0,
		};
		const observer = new IntersectionObserver(handleScroll, options);
		if (scrollTarget.current) observer.observe(scrollTarget.current);
	}, [handleScroll]);

	useEffect(() => {
		const count = sortedResults.length;
		if (count < 1) setSearchResultText('No results found');
		else if (count == 1) setSearchResultText('1 profile found');
		else setSearchResultText(`${sortedResults.length} profiles found`);
	}, [sortedResults]);

	if (loadStatus == LoadStatus.LOADING)
		return (
			<section className="section has-element-centered">
				<div className="loader"></div>
			</section>
		);
	if (loadStatus == LoadStatus.ERROR)
		return (
			<section className="section has-text-centered">
				<h3 className="title is-3">Error loading profiles</h3>
			</section>
		);
	return sortedResults.length > 0 ? (
		<section className="section has-text-centered">
			<h5 className="title is-5">{searchResultText}</h5>
			{sortedResults.slice(0, endIndex).map((result, index) => (
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
			{endIndex < sortedResults.length ? (
				<div ref={scrollTarget}>Loading</div>
			) : (
				<section className="section has-text-centered">
					<h3 className="title is-3">No more matching profiles</h3>
				</section>
			)}
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
				<div className="columns card my-6">
					<div className="column card-image has-text-left is-two-thirds">
						<figure className="image">
							<img
								src={`${authAPI.defaults.baseURL}/images/${profile_image}`}
								alt="Placeholder image"
								crossOrigin=""
							/>
						</figure>
						<div className="is-overlay card-content">
							<OnlineIndicator onlineStatus={online} />
						</div>
					</div>
					<div className="column mt-3 has-text-left">
						<div className="block">Name: {name}</div>
						<div className="block">
							Age: {birthday && convertBirthdayToAge(birthday)}
						</div>
						<div className="block">Famerating: {famerating}</div>
						<div className="block">
							Distance: {`${distance} km`}
						</div>
						<div className="block">City: {city}</div>
						<div className="block">Country: {country}</div>
						<div className="block">
							Interests:{' '}
							{interests
								? Object.entries(JSON.parse(interests)).map(
										(interest, index) => (
											<span
												className="tag is-primary mx-2 my-1"
												key={index}
											>
												{interest[1] as string}
											</span>
										)
								  )
								: null}
						</div>
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

export const CountrySearchSelector = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return (
		<div className="block">
			<label htmlFor="country" className="label my-3">
				Country
			</label>
			<div className="select is-primary">
				<select
					id="country"
					name="country"
					value={searchParams.country}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							country: event.target.value,
						})
					}
				>
					<option value={''}>Choose a country</option>
					{Country.getAllCountries().map((country, index) => (
						<option
							key={`${country.name}${index}`}
							value={country.isoCode}
						>
							{country.name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export const CitySearchSelector = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return searchParams.country ? (
		<div className="block">
			<label htmlFor="city" className="label my-3">
				City
			</label>
			<div className="select is-primary">
				<select
					id="city"
					name="city"
					value={searchParams.city}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							city: event.target.value,
						})
					}
				>
					<option value={''}>Choose a city</option>
					{City.getCitiesOfCountry(searchParams.country)?.map(
						(city, index) => (
							<option
								key={`${city.name}${index}`}
								value={city.name}
							>
								{city.name}
							</option>
						)
					)}
				</select>
			</div>
		</div>
	) : (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				City
			</label>
			<div className="select is-primary disabled">
				<select
					id="city"
					value={searchParams?.city}
					onChange={(event) =>
						setSearchParams({
							...searchParams,
							city: event.target.value,
						})
					}
				>
					<option value={''} disabled>
						Choose a country first
					</option>
				</select>
			</div>
		</div>
	);
};
