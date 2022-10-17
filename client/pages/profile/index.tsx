import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { NewProfileButton } from '../../components/buttons';
import { CreateProfile } from '../../components/createProfile';
import { LandingPage } from '../../components/landingPage';
import { useNotificationContext } from '../../components/NotificationContext';
import { ProfileView } from '../../components/profile';
import { UpdateProfile } from '../../components/updateProfile';
import { useUserContext } from '../../components/UserContext';
import { ActivePage, EditProps, ViewProps } from '../../types/types';
import { authAPI } from '../../utilities/api';

const LoggedIn = () => {
	const { userData, updateUserData, profile, setProfile } = useUserContext();
	const { setActivePage, setMatchData } = useNotificationContext();
	const [editMode, setEditMode] = useState(false);

	// Fetch profile data
	useEffect(() => {
		const getUserProfile = async () => {
			if (!userData.user_id) return;
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
				} else updateUserData({ ...userData, profile_exists: false });
			} catch (err) {}
		};
		getUserProfile();
		setActivePage(ActivePage.PROFILE);
		setMatchData({})
	}, [userData.user_id]);

	return editMode ? (
		<EditMode
			setEditMode={setEditMode}
			profile={profile}
			setProfile={setProfile}
		/>
	) : (
		<ViewMode setEditMode={setEditMode} profile={profile} />
	);
};

// Edit profile
const EditMode = ({ setEditMode, profile, setProfile }: EditProps) => {
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

// View profile
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
		<div className="columns is-centered is-gapless">
			<div className="column is-three-quarters">
				{accessToken ? <LoggedIn /> : <LandingPage />}
			</div>
		</div>
	);
};

export default Profile;
