import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Results, ProfileSearch } from '../../components/search';
import { useUserContext } from '../../components/UserContext';
import { LoadStatus, SortType, IResultsProfile, ActivePage } from '../../types/types';
import {
	convertBirthdayToAge,
	handleRouteError,
} from '../../utilities/helpers';
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
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../components/utilities';
import { LandingPage } from '../../components/landingPage';
import { useNotificationContext } from '../../components/NotificationContext';

const LoggedIn = () => {
	const { profile, userData } = useUserContext();
	const [sort, setSort] = useState<SortType>(SortType.DISTANCE);
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [searchParams, setSearchParams] = useState({
		gender: profile.gender,
		looking: profile.looking,
		country: '',
		city: '',
		min_age: profile.min_age || convertBirthdayToAge(profile.birthday) - 5,
		max_age: profile.max_age || convertBirthdayToAge(profile.birthday) + 5,
		min_famerating: '',
		max_famerating: '',
		max_distance: '',
	});
	const [results, setResults] = useState<IResultsProfile[]>([]);
	const [filteredResults, setFilteredResults] = useState<IResultsProfile[]>(
		[]
	);
	const [sortedResults, setSortedResults] = useState<IResultsProfile[]>([]);
	const [wasRedirected, setWasRedirected] = useState(false);
	const { setActivePage, setMatchData } = useNotificationContext();
	const router = useRouter();

	// Router error event listener and handler
	useEffect(() => {
		router.events.on('routeChangeError', handleRouteError);
		return () => {
			router.events.off('routeChangeError', handleRouteError);
		};
	}, []);

	// Set Active Page
	useEffect(() => {
		setActivePage(ActivePage.SEARCH)
		setMatchData({})
	}, []);

	// Redirect if user has no profile
	useEffect(() => {
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
		router.replace('/profile');
	}, [userData.profile_exists]);

	// Needs to exist to make sure these searchParams don't end up undefined on reload.
	useEffect(() => {
		setSearchParams({
			...searchParams,
			gender: profile.gender,
			looking: profile.looking,
		});
	}, [profile.gender, profile.looking]);

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
		filteredResults,
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
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<div className="columns is-centered is-gapless">
				<div className="column is-three-quarters">
					{accessToken ? <LoggedIn /> : <LandingPage />}
				</div>
			</div>
		</ErrorBoundary>
	);
};

export default Search;
