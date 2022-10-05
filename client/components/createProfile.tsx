import { useEffect, useState } from 'react';
import { dummyData } from './data';
import { EditProps } from '../types/types';
import { authAPI } from '../utilities/api';
import { convertBirthdayToAge } from '../utilities/helpers';
import {
	AgeRange,
	ErrorMessage,
	GenderSelector,
	LookingSelector,
	TextArea,
} from './form';
import { FileInput, SearchResult } from './profile';
import { useUserContext } from './UserContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Spinner } from './utilities';

// Dynamically imported components
const CitySelector = dynamic(() => import('./profileCitySelector'), {
	suspense: true,
});
const CountrySelector = dynamic(() => import('./profileCountrySelector'), {
	suspense: true,
});

// Profile creation page component
export const CreateProfile = ({
	setEditMode,
	profile,
	setProfile,
}: EditProps) => {
	const [tagError, setTagError] = useState(false);
	const [success, setSuccess] = useState(false);
	const [interestsError, setInterestsError] = useState(false);
	const [fileError, setFileError] = useState(false);
	const [files, setFiles] = useState<FileList>();
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);
	const { userData, updateUserData } = useUserContext();
	const age = convertBirthdayToAge(userData.birthday);

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	// Preset profile values
	useEffect(() => {
		setInterests(profile.interests);
		setProfile({ ...profile, min_age: age - 5, max_age: age + 5 });
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

	const uploadPhotos = async () => {
		if (!files || files.length < 1) {
			setFileError(true);
			return;
		}
		// Add files to formData
		const imageData = new FormData();
		for (let i = 0; i < files.length; i++) {
			imageData.append('files', files[i], files[i].name);
		}
		// Upload to server
		const response = await authAPI.post('/image', imageData);
		return response;
	};

	const uploadProfile = async () => {
		try {
			// Check photos
			if (!files || files.length < 1) {
				setFileError(true);
				return;
			}
			// Check interests amount
			if (interests?.length < 1) {
				setInterestsError(true);
				return;
			}
			// Add interests object to profile
			let payload = profile;
			payload.interests = interests;
			// upload photos
			const photoUpload = await uploadPhotos();
			if (!photoUpload) {
				setFileError(true);
				return;
			}
			// Get profile picture filename
			payload.profile_image =
				profile.profile_image === 'default.png'
					? photoUpload.data.filenames[0]
					: photoUpload.data.filenames[profile.profile_image];
			// Add other information user can't change
			payload.birthday = userData.birthday;
			payload.name = userData.name;
			// Upload profile
			const response = await authAPI.post(`/profile`, payload);
			if (response.status === 200) {
				setSuccess(true);
				setTimeout(() => {
					setSuccess(false);
					setEditMode(false);
					updateUserData({ ...userData, profile_exists: true });
					sessionStorage.setItem('profile', JSON.stringify(payload));
				}, 2000);
			}
		} catch (err) {}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		uploadProfile();
	};

	return success ? (
		<div className="my-6 pt-6">
			<div className="card p-3 rounded-corners has-text-centered">
				<section className="section">
					<h3 className="title is-3">Profile created successfully</h3>
				</section>
			</div>
		</div>
	) : (
		<div className="my-6">
			<form onSubmit={handleSubmit}>
				<section className="section">
					<h1 className="title is-1">Create new profile</h1>

					{/* Location. Components imported dynamically*/}
					<Suspense fallback={<Spinner />}>
						<CountrySelector
							profile={profile}
							setProfile={setProfile}
							isRequired={true}
						/>
						<CitySelector
							profile={profile}
							setProfile={setProfile}
							isRequired={true}
						/>
					</Suspense>

					{/* Gender */}
					<GenderSelector
						profile={profile}
						setProfile={setProfile}
						isRequired={true}
					/>

					{/* Introduction */}
					<TextArea
						label="Introduction *"
						id="introduction"
						value={profile.introduction}
						placeholder="Introduction"
						size={10}
						onChange={(
							event: React.ChangeEvent<HTMLInputElement>
						) =>
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
						<ErrorMessage
							errorMessage="You must choose at least one interest."
							error={interestsError}
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
					<FileInput files={files} setFiles={setFiles} />
					<ErrorMessage
						errorMessage="You must upload at least one picture."
						error={fileError}
					/>

					<h3 className="title is-3 mt-6">
						What kind of partner are you looking for?
					</h3>
					{/* Looking For */}
					<LookingSelector
						profile={profile}
						setProfile={setProfile}
						isRequired={true}
					/>

					{/* Age range */}
					<AgeRange profile={profile} setProfile={setProfile} />
					<button type="submit" className="button is-primary">
						Save profile
					</button>
				</section>
			</form>
		</div>
	);
};
