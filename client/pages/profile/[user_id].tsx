import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { Gallery } from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { IOtherUser, IProfile, OtherUserViewProps } from '../../types/types';
import { authAPI } from '../../utilities/api';
import { FcLike } from 'react-icons/fc';

const NotLoggedIn = () => {
	return (
		<div>
			<section className="section">
				<p>Please log in first.</p>
			</section>
		</div>
	);
};

const LoggedIn = () => {
	const { profile, setProfile } = useUserContext();
	const [editMode, setEditMode] = useState(false);
	const [profileExists, setProfileExists] = useState(false);

	const router = useRouter();

	const getUserProfile = async () => {
		const { user_id } = router.query;
		let response = await authAPI.get(`/profile/${user_id}`);
		if (response?.data?.profile) {
			setProfileExists(true);
			response.data.profile.interests = JSON.parse(
				response.data.profile.interests
			);
			setProfile(response.data.profile);
		} else setProfileExists(false);
	};
	useEffect(() => {
		if (router.isReady) {
			getUserProfile();
		}
	}, [router.isReady]);

	return profileExists ? (
		<ViewMode profile={profile} />
	) : (
		<section className="section has-text-centered">
			<h3 className="title is-3">No profile found.</h3>
		</section>
	);
};

const ViewMode = ({ profile }: OtherUserViewProps) => {
	const { userData } = useUserContext();

	const likeProfile = async () => {
		const liked = profile.user_id;
		const liker = userData.user_id;

		const response = await authAPI.post('/like', {
			liker: liker,
			liked: liked,
		});
	};
	const handleClick = () => {
		likeProfile();
	};

	return (
		<div>
			<section className="section">
				<Gallery user_id={profile.user_id} />
				<div className="block">Name: {profile.name}</div>
				<div className="block">Age: {profile.age}</div>
				<div className="block">City: {profile.city}</div>
				<div className="block">Country: {profile.country}</div>
				<div className="block">
					Introduction: {profile.introduction}
				</div>
				<div className="block">
					Interests:{' '}
					{profile.interests
						? Object.entries(profile.interests).map(
								(interest, index) => (
									<span
										className="tag is-success is-medium is-rounded is-clickable mx-2 my-1"
										key={index}
									>
										{interest[1] as string}
									</span>
								)
						  )
						: null}
				</div>
				<div className="block">Gender: {profile.gender}</div>
				<div className="block">Looking for: {profile.looking}</div>
				<div className="block">Minimum age: {profile.min_age}</div>
				<div className="block">Maximum age: {profile.max_age}</div>
				<div className="block">User ID: {profile.user_id}</div>
				<div className="block buttons">
					<button
						className="button is-primary is-medium"
						onClick={handleClick}
					>
						<span className="icon is-medium">
							<FcLike />
						</span>
						<span>Like</span>
					</button>
				</div>
			</section>
		</div>
	);
};

const ShowProfile: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default ShowProfile;