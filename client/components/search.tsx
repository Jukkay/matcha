import React, { useState, useEffect } from 'react';
import { SearchResult } from './profile';
import { useUserContext } from './UserContext';
import {
	AdvancedSearchProps,
	BasicSearchProps,
	IAgeRangeSlider,
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
	convertBirthdayToAge,
} from '../utilities/helpers';
import { moreCommonTagsFirst } from '../utilities/sort';
import { DistanceRange, ErrorMessage, FameratingRange } from './form';
import { dummyData } from './data';
import { LoadError, Spinner } from './utilities';
import { FaFilter } from 'react-icons/fa';
import { BiSortAlt2 } from 'react-icons/bi';
import { IconContext } from 'react-icons';
import Slider from '@mui/material/Slider';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LocationPermissionRequest } from './locationPermissionRequest';
import { SearchResultItem } from './profileCards';
import { SubmitAndResetButtons } from './buttons';

// Dynamically imported components
const CitySearchSelector = dynamic(() => import('./searchCitySelector'), {
	suspense: true,
});
const CountrySearchSelector = dynamic(() => import('./searchCountrySelector'), {
	suspense: true,
});

export const ProfileSearch = ({
	searchParams,
	setSearchParams,
	setResults,
	results,
	setFilteredResults,
	setLoadStatus,
	sort,
	setSort,
}: SearchProps) => {
	const { profile } = useUserContext();
	const [interests, setInterests] = useState<string[]>([]);
	const [formSubmit, setFormSubmit] = useState(false);

	const searchDatabase = async (controller: AbortController) => {
		const query = {
			gender: profile.gender,
			looking: searchParams.looking,
			min_age: searchParams.min_age,
			max_age: searchParams.max_age,
			country: searchParams.country,
			city: searchParams.city,
		};
		if (!query.gender || !query.looking || !query.min_age || !query.max_age)
			return;
		try {
			setLoadStatus(LoadStatus.LOADING);
			let response = await authAPI.post(`/search`, {
				data: query,
				signal: controller.signal,
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
		} finally {
			setLoadStatus(LoadStatus.IDLE);
		}
	};

	useEffect(() => {
		const controller = new AbortController();
		searchDatabase(controller);
		return () => controller.abort();
	}, [formSubmit]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setFormSubmit(!formSubmit);
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
		<div className="my-6">
			<h1 className="title is-1">Search</h1>
			<form onSubmit={handleSubmit}>
				<BasicSearchLine
					searchParams={searchParams}
					setSearchParams={setSearchParams}
					resetSearch={resetSearch}
					handleSubmit={handleSubmit}
				/>
			</form>
			<hr />

			<Filters
				searchParams={searchParams}
				setSearchParams={setSearchParams}
				interests={interests}
				setInterests={setInterests}
				results={results}
				setFilteredResults={setFilteredResults}
				sort={sort}
				setSort={setSort}
			/>
		</div>
	);
};

const Filters = ({
	searchParams,
	setSearchParams,
	interests,
	setInterests,
	results,
	setFilteredResults,
	sort,
	setSort,
}: AdvancedSearchProps) => {
	const [visible, setVisible] = useState(false);

	const onClick = () => setVisible((visible) => !visible);

	const handleFilters = (event: React.FormEvent) => {
		event.preventDefault();
		let filteredResults = results;

		// Filter by distance
		if (Number(searchParams.max_distance) > 0) {
			filteredResults = [...filteredResults].filter(
				(item) =>
					Number(item.distance) <= Number(searchParams.max_distance)
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
		if (Number(searchParams.min_famerating) > 0) {
			filteredResults = [...filteredResults].filter(
				(item) =>
					Number(item.famerating) >=
						Number(searchParams.min_famerating) &&
					Number(item.famerating) <=
						Number(searchParams.max_famerating)
			);
		}
		setFilteredResults(filteredResults);
	};

	const handleReset = (event: React.FormEvent) => {
		event.preventDefault();
		setSearchParams({
			...searchParams,
			max_distance: 0,
			min_famerating: 1,
			max_famerating: 1000,
		});
		setInterests([]);
		setFilteredResults(results);
	};

	return visible ? (
		<div className="block">
			<div className="block">
				<div className="columns is-centered is-gapless">
					<div className="column is-one-third">
						<div className="is-flex is-align-items-baseline">
							<label htmlFor="filter" className="label">
								Filter
							</label>
							<span className="icon is-medium">
								<IconContext.Provider
									value={{
										size: '0.9rem',
										className: 'react-icons',
									}}
								>
									<div>
										<FaFilter />
									</div>
								</IconContext.Provider>
							</span>
						</div>
						<button className="button" onClick={onClick}>
							Hide filters
						</button>
					</div>
					<div className="column is-one-third">{}</div>
					<SortSelector sort={sort} setSort={setSort} />
				</div>
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
			<div className="block is-pulled-right">
				<button
					className="button is-primary m-1"
					onClick={handleFilters}
				>
					Apply filters
				</button>
				<button className="button is-primary m-1" onClick={handleReset}>
					Reset filters
				</button>
			</div>
		</div>
	) : (
		<div className="block">
			<div className="columns is-centered is-gapless">
				<div className="column is-one-third">
					<div className="is-flex is-align-items-baseline">
						<label htmlFor="filter" className="label">
							Filter
						</label>
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									size: '0.9rem',
									className: 'react-icons',
								}}
							>
								<div>
									<FaFilter />
								</div>
							</IconContext.Provider>
						</span>
					</div>
					<button className="button" onClick={onClick}>
						Show filters
					</button>
				</div>
				<div className="column is-one-third">{}</div>
				<SortSelector sort={sort} setSort={setSort} />
			</div>
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

export const Results = ({ sortedResults, loadStatus }: ResultsProps) => {
	const [searchResultText, setSearchResultText] = useState('');
	const [endIndex, setEndIndex] = useState(9);

	// Infinite scroll hooks
	const { ref, inView } = useInView({
		threshold: 0,
	});
	useEffect(() => {
		if (inView) {
			setEndIndex((endIndex) => endIndex + 10);
		}
	}, [inView]);

	// Show how many profiles found
	useEffect(() => {
		const count = sortedResults.length;
		if (count < 1) setSearchResultText('No results found');
		else if (count == 1) setSearchResultText('1 profile found');
		else setSearchResultText(`${sortedResults.length} profiles found`);
	}, [sortedResults]);

	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profiles" />;

	return sortedResults.length > 0 ? (
		<div>
			<h5 className="title is-5">{searchResultText}</h5>
			<div>
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
					/>
				))}
				{endIndex < sortedResults.length ? (
					<div ref={ref}>
						<Spinner />
					</div>
				) : (
					<section className="section has-text-centered">
						<h3 className="title is-3">
							No more matching profiles
						</h3>
					</section>
				)}
			</div>
		</div>
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No matching profiles found</h3>
		</section>
	);
};

export const SortSelector = ({ sort, setSort }: SortProps) => {
	return (
		<div className="column is-one-third">
			<div className="is-flex is-align-items-start">
				<label htmlFor="sort" className="label">
					Sort by
				</label>
				<span className="icon is-medium">
					<IconContext.Provider
						value={{
							size: '1.3rem',
							className: 'react-icons',
						}}
					>
						<div>
							<BiSortAlt2 />
						</div>
					</IconContext.Provider>
				</span>
			</div>
			<div className="select">
				<select
					id="sort"
					name="sort"
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

export const BasicSearchLine = ({
	searchParams,
	setSearchParams,
	resetSearch,
	handleSubmit,
}: BasicSearchProps) => {
	const [optionalsVisible, setOptionalsVisible] = useState(false);
	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault();
		setOptionalsVisible((current) => !current);
	};

	return optionalsVisible ? (
		<div>
			<div className="columns is-centered is-gapless">
				<SearchAgeRange
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<SearchGenderSelector
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<SubmitAndResetButtons
					resetSearch={resetSearch}
					handleSubmit={handleSubmit}
				/>
			</div>
			<div className="columns is-centered is-gapless">
				<div className="buttons column is-one-third">
					<button
						className="button is-ghost has-text-black"
						onClick={handleClick}
					>
						Hide optional parameters
					</button>
					<button className="button is-ghost" onClick={handleClick}>
						<span className="bulma-arrow-mixin"></span>
					</button>
				</div>
				<div className="column is-one-third">{}</div>
				<div className="column is-one-third">
					<LocationPermissionRequest />
				</div>
			</div>
			<div className="columns is-centered is-gapless">
				{/* Location. Components imported dynamically */}
				<Suspense fallback={<Spinner />}>
					<div className="column is-one-third">
						<CountrySearchSelector
							searchParams={searchParams}
							setSearchParams={setSearchParams}
						/>
					</div>
					<div className="column is-one-third">{}</div>
					<div className="column is-one-third">
						<CitySearchSelector
							searchParams={searchParams}
							setSearchParams={setSearchParams}
						/>
					</div>
				</Suspense>
			</div>
		</div>
	) : (
		<div>
			<div className="columns is-centered is-gapless">
				<SearchAgeRange
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<SearchGenderSelector
					searchParams={searchParams}
					setSearchParams={setSearchParams}
				/>
				<SubmitAndResetButtons
					resetSearch={resetSearch}
					handleSubmit={handleSubmit}
				/>
			</div>
			<div className="columns is-centered is-gapless">
				<div className="buttons column is-one-third">
					<button
						className="button is-ghost has-text-black"
						onClick={handleClick}
					>
						Search by location
					</button>
					<button className="button is-ghost" onClick={handleClick}>
						<span className="bulma-arrow-mixin"></span>
					</button>
				</div>
				<div className="column is-one-third">{}</div>
				<div className="column is-one-third">
					<LocationPermissionRequest />
				</div>
			</div>
		</div>
	);
};

export const AgeRangeSlider = ({ state, setState }: IAgeRangeSlider) => {
	const [value, setValue] = React.useState<number[]>([
		state.min_age,
		state.max_age,
	]);

	useEffect(() => {
		setValue([state.min_age, state.max_age]);
	}, [state.min_age, state.max_age]);

	const handleChange = (_event: Event, newValue: number | number[]) => {
		const array = newValue as number[];
		setState({
			...state,
			min_age: array[0],
			max_age: array[1],
		});
	};

	return (
		<div className="mx-3">
			<Slider
				sx={{ width: 250, color: 'hsl(315, 97%, 26%)' }}
				getAriaLabel={() => 'Age range'}
				value={value}
				onChange={handleChange}
				min={18}
				max={100}
				valueLabelDisplay="on"
				disableSwap
			/>
		</div>
	);
};

export const SearchAgeRange = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return (
		<div className="column is-one-third">
			<div className="field">
				<label htmlFor="ageRange" className="label mb-6">
					Age range *
				</label>
				<div className="control" id="ageRange">
					<AgeRangeSlider
						state={searchParams}
						setState={setSearchParams}
					/>
				</div>
			</div>
		</div>
	);
};

export const SearchGenderSelector = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	return (
		<div className="column is-one-third">
			<div className="">
				<label htmlFor="looking" className="label">
					Gender *
				</label>
				<div className="select is-primary">
					<select
						id="looking"
						value={searchParams.looking}
						onChange={(event) =>
							setSearchParams({
								...searchParams,
								looking: event.target.value,
							})
						}
					>
						<option value={''} disabled>
							Choose a gender
						</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
						<option value="Non-binary">Non-binary</option>
						<option value="Trans-man">Trans-man</option>
						<option value="Trans-woman">Trans-woman</option>
						<option value="Anything goes">Anything goes</option>
					</select>
				</div>
			</div>
		</div>
	);
};
