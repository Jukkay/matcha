import { NextPage } from 'next';

const About: NextPage = () => {
	return (
		<div className="columns is-centered is-gapless">
			<div className="column is-three-quarters mt-6 pt-6 content">
				<section className="section">
					<h1 className="title is-1">About</h1>
					<p>
						Matcha is a dating app project made for my studies at
						Hive Helsinki Coding School. The app is built with React
						on Next.js create-next-app. Backend is using Node and
						Express with MariaDB database. Userbase has about 3800
						dummy users created using Random User Generator API and
						Node script, so unfortunately this is not the place to
						find real love.
					</p>
					<p>
						The app has basic functionality including dating
						profile, suggested matches based on preferences, profile
						search, instant notifications, and instant messaging
						between matched users. Users are located using
						Geolocation API and it falls back on IP location with
						Fast-geoip library. You're free to try it out, but it
						requires registration with working email address.
						Unfortunately matches cannot be simulated unless you
						create two users that like each other. The accounts can
						be removed after testing.
					</p>
				</section>
				<section className="section">
					<h3 className="title is-3">Technologies</h3>
					<ul>
						<li>React</li>
						<li>Next.js</li>
						<li>Typescript</li>
						<li>Node</li>
						<li>Express</li>
						<li>MariaDB</li>
						<li>Socket.io</li>
						<li>JSON web tokens</li>
						<li>Axios</li>
						<li>Geolocation API</li>
						<li>Random User Generator API</li>
						<li>Docker</li>
						<li>AWS</li>
					</ul>

					<p>
						Next.js is used mainly as a create-react-app
						replacement. No server-side rendering is used for this
						project and API is done with Node and Express. API
						authentication is done with JSON web tokens. Axios
						interceptor tries to refresh access tokens automatically
						if response status is 401. Socket.io is used for
						handling websocket connections for notifications and
						instant messaging.
					</p>
					<p>
						Development environment and deployment to AWS is done
						with Docker.
					</p>
					<p>
						The project can be found in Github here:{' '}
                        <a href="https://github.com/Jukkay/matcha">https://github.com/Jukkay/matcha</a>
					</p>
				</section>
			</div>
		</div>
	);
};

export default About;
