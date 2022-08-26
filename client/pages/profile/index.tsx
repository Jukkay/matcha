import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useNotificationContext } from '../../components/NotificationContext';
import {
	CreateProfile,
	NewProfileButton,
	ProfileView,
	UpdateProfile,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { ActivePage, EditProps, IProfile, ViewProps } from '../../types/types';
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
	const { userData, updateUserData, profile, setProfile } = useUserContext();
	const { setActivePage } = useNotificationContext()
	const [editMode, setEditMode] = useState(false);
	
	useEffect(() => {
		const getUserProfile = async () => {
			try {
				let response = await authAPI.get(
					`/profile/${userData.user_id}`
				);
				if (response?.data?.profile) {
					updateUserData({ ...userData, profile_exists: true });
					response.data.profile.interests = JSON.parse(
						response.data.profile.interests
					);
					setProfile(response.data.profile);
					sessionStorage.setItem(
						'profile',
						JSON.stringify(response.data.profile)
					);
				} else updateUserData({ ...userData, profile_exists: false });
			} catch (err) {
				console.error(err);
			} 
		};
		getUserProfile();
		setActivePage(ActivePage.PROFILE)
	}, []);

	useEffect(() => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					if (position) {
						setProfile({...profile, latitude: position.coords.latitude, longitude: position.coords.longitude})
						console.log('geolocation', position)
					}
					}, 
				(error) => console.log('Geolocation not permitted by user.', error))
		}
	}, []);

	return editMode ? (
		<EditMode
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
		/>
	) : (
		<ViewMode
			setEditMode={setEditMode}
			profile={profile}
		/>
	);
};

const EditMode = ({
	setEditMode,
	profile,
	setProfile
}: EditProps) => {
	const { userData } = useUserContext();
	return userData.profile_exists ? (
		<UpdateProfile
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
		/>
	) : (
		<CreateProfile
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
		/>
	);
};
const ViewMode = ({ setEditMode, profile }: ViewProps) => {
	const { userData } = useUserContext();
	return userData.profile_exists ? (
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
