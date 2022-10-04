import Link from 'next/link';

const Footer = () => {
	return (
		<footer className="column is-narrow has-background-primary-light has-text-primary">
			<div className="columns is-centered is-gapless pt-3 pb-4">
				<div className="column has-text-centered">
					<Link href="/about">
						<a className="link">About</a>
					</Link>
				</div>
				<div className="column has-text-centered">
					<Link href="/terms">
						<a className="">Terms and conditions</a>
					</Link>
				</div>
				<div className="column has-text-centered">
					<Link href="/privacy">
						<a className="">Privacy policy</a>
					</Link>
				</div>
			</div>
		</footer>
	);
};
export default Footer;
