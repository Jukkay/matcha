import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { ErrorMessage } from '../../components/form';
import {
	AgeRange,
	CitySelector,
	CountrySelector,
	EditButton,
	FileInput,
	GenderSelector,
	SaveButton,
	SearchResult,
	TextArea,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { EditProps, IProfile } from '../../types/types';
import { dummyData } from './data';
import { Country, City } from 'country-state-city';

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
	return editMode ? (
		<EditMode setEditMode={setEditMode} />
	) : (
		<ViewMode setEditMode={setEditMode} />
	);
};

const EditMode = ({ setEditMode }: EditProps) => {
	const { userData, accessToken } = useUserContext();
	const [profile, setProfile] = useState<IProfile>({
		gender: '',
		looking: '',
		min_age: userData.age,
		max_age: userData.age,
		introduction: '',
		country: '',
		city: '',
	});
	const [tagError, setTagError] = useState(false);
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

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
			<h3 className="title is-3">Tell us about yourself</h3>
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
				<FileInput />

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

				<SaveButton setEditMode={setEditMode} profile={profile} />
			</section>
		</div>
	);
};
const ViewMode = ({ setEditMode }: EditProps) => {
	const { userData, accessToken } = useUserContext();
	return (
		<div>
			<section className="section">
				<div className="block">{userData.username}</div>
				<div className="block">{userData.email}</div>
				<div className="block">{userData.name}</div>
				<div className="block">{userData.user_id}</div>

				<EditButton setEditMode={setEditMode} />
			</section>
		</div>
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
