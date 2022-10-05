import { ErrorFallback } from '../components/utilities';
import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';

export const LandingPage = () => {
	return (
		<div className="columns is-centered my-6 pt-6">
			<div className="column is-three-quarters has-text-centered">
				<section className="section">
					<h1 className="title is-1">Welcome to</h1>
					<img
						className="image"
						src="/logo_frontpage.svg"
						alt="42 Dates Logo"
					/>
				</section>
				<div className="my-3">
					<div className="buttons is-justify-content-center">
						<ErrorBoundary FallbackComponent={ErrorFallback}>
							<div className="mx-2">
								<Link href="/signup">
									<a className="button is-primary">Sign up</a>
								</Link>
							</div>
							<div className="mx-2">
								<Link href="/login">
									<a className="button is-primary is-outlined">
										Log in
									</a>
								</Link>
							</div>
						</ErrorBoundary>
					</div>
				</div>
			</div>
		</div>
	);
};
