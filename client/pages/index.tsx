import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useUserContext } from '../components/UserContext';

const NotLoggedIn = () => {
	return (
		<section className="section">
			<h1 className="title is-1">Welcome to 42 Dates</h1>
		</section>
	);
};

const LoggedIn = () => {
	const { userData } = useUserContext();
	// Router for redirect after login
	const router = useRouter();

	if (!userData.profile_exists) router.replace('/profile');

	return <div>Profile is complete. Front page here.</div>;
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
