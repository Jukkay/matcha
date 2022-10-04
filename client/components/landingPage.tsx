import { ErrorFallback } from '../components/utilities';
import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';

export const LandingPage = () => {
	return (
		<div className="columns is-centered my-6 pt-6">
			<div className="column is-three-quarters has-text-centered">
				<h1 className="title is-1">Welcome to</h1>
				<section className="section">
				<img
					className="image"
					src="/logo_frontpage.svg"
					alt="42 Dates Logo"
				/>
				</section>
				<ErrorBoundary FallbackComponent={ErrorFallback}>
					<p className="my-3">
						<Link href="/signup">
							<a className="button is-primary">Sign up</a>
						</Link>
					</p>
					<h4 className="title is-4 has-text-primary">or</h4>
					<p className="my-3">
						<Link href="/login">
							<a className="button is-primary is-outlined">Log in</a>
						</Link>
					</p>
					<h4 className="title is-4 has-text-primary my-3">to continue</h4>
				</ErrorBoundary>
			</div>
		</div>
	);
};