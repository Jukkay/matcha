import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
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
	const isFirstRender = useRef(true)
	const router = useRouter();

	// Redirect if user has no profile
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return
		}
		if (wasRedirected || userData.profile_exists) return;
		setWasRedirected(true);
    	router.replace('/profile')
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
