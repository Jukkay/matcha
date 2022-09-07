import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUserContext } from '../components/UserContext';

const NotLoggedIn = () => {
	return (
		<section className="section">
			<h1 className="title is-1">Welcome to 42 Dates</h1>
		</section>
	);
};

const LoggedIn = () => {
	const { userData, profile, setProfile } = useUserContext();
	const [wasRedirected, setWasRedirected] = useState(false);
	const router = useRouter();

	// Redirect if user has no profile
	useEffect(() => {
		if (wasRedirected || userData.profile_exists) return;
		let latestState
		setWasRedirected(latest => {latestState = latest; return true});
		if (latestState) return
		console.log('Redirect from front page')
		router.replace('/profile');
	}, [userData.profile_exists]);

	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => setProfile({ ...profile, geolocation: position }),
				(error) =>
					console.log('Geolocation not permitted by user.', error)
			);
		}
	}, []);

	return (
		<section className="section">
			<div>Profile is complete. Front page here.</div>
		</section>
	);
};

const Home: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Home;
