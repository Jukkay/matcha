import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ClosestList, CommonInterestsList, FameratingList, RandomList, Recommendations } from '../components/frontpage';
import { useUserContext } from '../components/UserContext';
import { IResultsProfile, LoadStatus } from '../types/types';
import { authAPI } from '../utilities/api';
import {
	addDistanceToProfiles,
	addCommonTagsToProfiles,
} from '../utilities/helpers';
import { moreCommonTagsFirst } from '../utilities/sort';

const NotLoggedIn = () => {
	return (
		<section className="section">
			<h1 className="title is-1">Welcome to 42 Dates</h1>
			<p>Sign up or login to continue</p>
		</section>
	);
};

const LoggedIn = () => {
	const { userData, profile, setProfile } = useUserContext();
	const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.IDLE);
	const [results, setResults] = useState<IResultsProfile[]>(
		[]
	);
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();

	// Redirect if user has no profile
	useEffect(() => {
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
		router.replace('/profile');
	}, [userData.profile_exists]);

	const searchDatabase = async () => {
		const query = {
			gender: profile.gender,
			looking: profile.looking,
			min_age: profile.min_age,
			max_age: profile.max_age,
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
			} else {
				setResults([]);
			}
		} catch (err) {
			setLoadStatus(LoadStatus.ERROR);
		} finally {
			setLoadStatus(LoadStatus.IDLE);
		}
	};

	useEffect(() => {
		searchDatabase();
	}, []);

	return (
		<section className="section">
			<section className="section">
			<h3 className="title is-3">Recommendations</h3>
			<Recommendations sortedResults={results} loadStatus={loadStatus} />
			</section>
			<section className="section">
			<h3 className="title is-3">Closest people</h3>
			<ClosestList sortedResults={results} loadStatus={loadStatus} />
			</section>
			<section className="section">
			<h3 className="title is-3">Most common interests</h3>
			<CommonInterestsList sortedResults={results} loadStatus={loadStatus} />
			</section>
			<section className="section">
			<h3 className="title is-3">Best Famerating</h3>
			<FameratingList sortedResults={results} loadStatus={loadStatus} />
			</section>
			<section className="section">
			<h3 className="title is-3">Random</h3>
			<RandomList sortedResults={results} loadStatus={loadStatus} />
			</section>
		</section>
	);
};

const Home: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered is-gapless">
			<div className="column is-11">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Home;
