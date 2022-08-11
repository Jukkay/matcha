import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import {
	CreateProfile,
	NewProfileButton,
	ProfileView,
	UpdateProfile,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { EditProps, IProfile, ViewProps } from '../../types/types';
import { authAPI } from '../../utilities/api';

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
	const { userData, accessToken } = useUserContext();
	const [editMode, setEditMode] = useState(false);
	const [profileExists, setProfileExists] = useState(false);
	const [profile, setProfile] = useState<IProfile>({
		user_id: userData.user_id,
		gender: '',
		looking: '',
		min_age: userData.age,
		max_age: userData.age,
		interests: {},
		introduction: '',
		country: '',
		city: '',
	});

	useEffect(() => {
		const getUserProfile = async () => {
			let response = await authAPI.get(`/profile/${userData.user_id}`);
			if (response?.data?.profile) {
				setProfileExists(true);
				response.data.profile.interests = JSON.parse(
					response.data.profile.interests
				);
				console.log(response.data.profile.interests);
				setProfile(response.data.profile);
			} else setProfileExists(false);
		};
		getUserProfile();
	}, []);

	return editMode ? (
		<EditMode
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
			profileExists={profileExists}
			setProfileExists={setProfileExists}
		/>
	) : (
		<ViewMode
			setEditMode={setEditMode}
			profile={profile}
			profileExists={profileExists}
		/>
	);
};

const EditMode = ({
	setEditMode,
	profile,
	setProfile,
	profileExists,
	setProfileExists,
}: EditProps) => {
	return profileExists ? (
		<UpdateProfile
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
			profileExists={profileExists}
			setProfileExists={setProfileExists}
		/>
	) : (
		<CreateProfile
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
			profileExists={profileExists}
			setProfileExists={setProfileExists}
		/>
	);
};
const ViewMode = ({ setEditMode, profile, profileExists }: ViewProps) => {
	return profileExists ? (
		<ProfileView profile={profile} setEditMode={setEditMode} />
	) : (
		<NewProfileButton setEditMode={setEditMode} />
	);
};

const Profile: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default Profile;
