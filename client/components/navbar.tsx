import Link from 'next/link';
import { useEffect } from 'react';
import { IconContext } from 'react-icons';
import { FaCog, FaHeart, FaBars, FaRegBell, FaBell } from 'react-icons/fa';
import { BsFillChatFill } from 'react-icons/bs';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';

const LoggedOutControls = () => {
	return (
		<>
			<Link href="/signup">
				<a className="button is-primary">Sign up</a>
			</Link>
			<Link href="/login">
				<a className="button">Log in</a>
			</Link>
		</>
	);
};

const LoggedInControls = () => {
	return (
		<>
			<div className="navbar-item" id="notifications">
				<a className="navbar-item">
					<span className="icon is-medium">
						<IconContext.Provider
							value={{
								size: '1.2rem',
								className: 'react-icons',
							}}
						>
							<div>
								<BsFillChatFill />
							</div>
						</IconContext.Provider>
					</span>
				</a>
			</div>
			<div className="navbar-item" id="notifications">
				<a className="navbar-item">
					<span className="icon is-medium">
						<IconContext.Provider
							value={{
								size: '1.2rem',
								className: 'react-icons',
							}}
						>
							<div>
								<FaBell />
							</div>
						</IconContext.Provider>
					</span>
				</a>
			</div>
			<ProfilePicture />
			<div className="navbar-item" id="controlpanel">
				<Link href="/controlpanel">
					<a className="navbar-item">
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									size: '1.2rem',
									className: 'react-icons',
								}}
							>
								<div>
									<FaCog />
								</div>
							</IconContext.Provider>
						</span>
					</a>
				</Link>
			</div>

			<Link href="/logout">
				<a className="button">Log out</a>
			</Link>
		</>
	);
};

const ProfilePicture = () => {
	const { userData, profile } = useUserContext();

	return (
		<div className="navbar-item" id="profile">
			<Link href="/profile">
				<a className="navbar-item">
					<p className="mr-3">
						<strong>{userData.username}</strong>
					</p>

					<figure className="image">
						<img
							className="is-rounded"
							src={
								profile.profile_image === 'default.png' ||
								!profile.profile_image
									? '/default.png'
									: `${authAPI.defaults.baseURL}/images/${profile.profile_image}`
							}
							onError={({ currentTarget }) => {
								currentTarget.onerror = null;
								currentTarget.src = '/default.png';
							}}
							alt="Profile picture"
							crossOrigin=""
						/>
					</figure>
				</a>
			</Link>
		</div>
	);
};

const NavbarComponent = () => {
	// Token state
	const { accessToken } = useUserContext();
	return (
		<div className="column is-narrow">
			<nav
				className="navbar"
				role="navigation"
				aria-label="main navigation"
			>
				<div className="navbar-brand">
					<a className="navbar-item pt-3" href="/">
						<span className="icon is-medium">
							<IconContext.Provider
								value={{
									size: '1.2rem',
									className: 'react-icons',
								}}
							>
								<div>
									<FaHeart />
								</div>
							</IconContext.Provider>
						</span>
					</a>
					<a
						role="button"
						className="navbar-burger"
						aria-label="menu"
						aria-expanded="false"
						data-target="navbar-burger-button"
					>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
					</a>
				</div>
				<div
					className="navbar-menu is-hidden mobile-menu"
					id="navbar-mobile"
				>
					<div className="navbar-end">
						<a className="navbar-item" href="/camera">
							Take picture
						</a>
						<a className="navbar-item" href="/newpost">
							New post
						</a>
						<a className="navbar-item" href="/profile">
							Profile
						</a>
						<a className="navbar-item" href="/controlpanel">
							Control panel
						</a>
						<hr className="navbar-divider" />
						<a className="navbar-item" href="/logout">
							Logout
						</a>
						<a className="navbar-item" href="/signup">
							Sign up
						</a>
						<a className="navbar-item" href="/login">
							Login
						</a>
					</div>
				</div>
				<div className="navbar-menu">
					<div className="navbar-start">
						<Link href="/discover">
							<a className="navbar-item">Discover</a>
						</Link>
						<Link href="/history">
							<a className="navbar-item">Recent profiles</a>
						</Link>
						<Link href="/messages">
							<a className="navbar-item">Messages</a>
						</Link>
					</div>
					<div className="navbar-end">
						<div className="navbar-item">
							<div className="buttons" id="buttons">
								{accessToken
									? LoggedInControls()
									: LoggedOutControls()}
							</div>
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
};
export default NavbarComponent;
