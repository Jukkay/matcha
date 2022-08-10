import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { ErrorMessage } from '../../components/form';
import {
	AgeRange,
	CitySelector,
	CountrySelector,
	EditButton,
	EditGallery,
	FileInput,
	Gallery,
	GenderSelector,
	NewProfileButton,
	ProfileView,
	SaveButton,
	SearchResult,
	TextArea,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { EditProps, IProfile, ViewProps } from '../../types/types';
import { dummyData } from './data';
import { Country, City } from 'country-state-city';
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
	const { userData, accessToken } = useUserContext();
	const [tagError, setTagError] = useState(false);
	const [files, setFiles] = useState<FileList>();
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};
	useEffect(() => {
		setInterests(Object.values(profile.interests))
	}, []);
	// Live query interest from interest list
	useEffect(() => {
		if (!query) {
			setResult([]);
			return;
		}
		const results = dummyData.filter((interest) =>
			interest.toLowerCase().includes(query.toLowerCase())
		);
		setResult(results as string[]);
	}, [query]);

	return (
		<div>
			<section className="section">
				{profileExists ? (
					<h3 className="title is-3">Edit profile</h3>
				) : (
					<h3 className="title is-3">Create new profile</h3>
				)}
				{/* Location */}
				<CountrySelector profile={profile} setProfile={setProfile} />
				<CitySelector profile={profile} setProfile={setProfile} />

				{/* Gender */}
				<GenderSelector
					label="Gender *"
					id="gender"
					value={profile.gender}
					placeholder="Choose your gender"
					onChange={(event) =>
						setProfile({
							...profile,
							gender: event.target.value,
						})
					}
					options={[
						'Male',
						'Female',
						'Non-binary',
						'Trans-man',
						'Trans-woman',
						'Other',
					]}
				/>

				{/* Introduction */}
				<TextArea
					label="Introduction *"
					id="introduction"
					value={profile.introduction}
					placeholder="Introduction"
					size={10}
					onChange={(event) =>
						setProfile({
							...profile,
							introduction: event.target.value,
						})
					}
				/>

				{/* Interests */}
				<div className="block">
					<label htmlFor="interests" className="label my-3">
						Interests (choose 1 to 5) *
					</label>
					<input
						className="input my-3"
						type="text"
						id="interests"
						placeholder="Search for interests"
						onChange={onChange}
					></input>
					<ErrorMessage
						errorMessage="Maximum 5 interests. Please unselect something to select something new."
						error={tagError}
					/>
					<SearchResult
						result={result}
						setResult={setResult}
						setTagError={setTagError}
						interests={interests}
						setInterests={setInterests}
						query={query}
					/>
				</div>
				{/* Pictures */}
				{profileExists ? <EditGallery files={files} /> : null}
				<FileInput profileExists={profileExists} files={files} setFiles={setFiles}/>
			</section>

			<section className="section">
				<h3 className="title is-3">What are you looking for?</h3>
				{/* Looking For */}
				<GenderSelector
					label="Looking for *"
					id="looking"
					value={profile.looking}
					placeholder="Choose a gender"
					onChange={(event) =>
						setProfile({
							...profile,
							looking: event.target.value,
						})
					}
					options={[
						'Male',
						'Female',
						'Non-binary',
						'Trans-man',
						'Trans-woman',
						'Other',
					]}
				/>

				{/* Age range */}
				<AgeRange profile={profile} setProfile={setProfile} />

				<SaveButton
					setEditMode={setEditMode}
					profile={profile}
					interests={interests}
					setProfileExists={setProfileExists}
				/>
			</section>
		</div>
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
