import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { ErrorMessage } from '../../components/form';
import {
	CitySelector,
	CountrySelector,
	EditButton,
	FileInput,
	SaveButton,
	SearchResult,
} from '../../components/profile';
import { useUserContext } from '../../components/UserContext';
import { EditProps, IProfile } from '../../types/types';
import { dummyData } from './data';

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
				{/* Location */}
				<CountrySelector profile={profile} setProfile={setProfile} />
				<CitySelector profile={profile} setProfile={setProfile} />
				{/* Gender */}
				<div className="block">
					<label htmlFor="gender" className="label my-3">
						Gender *
					</label>
					<div className="select is-primary">
						<select
							id="gender"
							value={profile.gender}
							onChange={(event) =>
								setProfile({
									...profile,
									gender: event.target.value,
								})
							}
							required
						>
							<option value={''} disabled>
								Choose your gender
							</option>
							<option value={'Male'}>Male</option>
							<option value={'Female'}>Female</option>
							<option value={'Non-binary'}>Non-binary</option>
							<option value={'Trans-man'}>Trans-man</option>
							<option value={'Trans-woman'}>Trans-woman</option>
							<option value={'Other'}>Other</option>
						</select>
					</div>
				</div>

				{/* Looking For */}
				<div className="block">
					<label htmlFor="looking" className="label my-3">
						Looking for *
					</label>
					<div className="select is-primary">
						<select
							id="looking"
							value={profile.looking}
							onChange={(event) =>
								setProfile({
									...profile,
									looking: event.target.value,
								})
							}
							required
						>
							<option value={''} disabled>
								Choose a gender
							</option>
							<option>Male</option>
							<option>Female</option>
							<option>Non-binary</option>
							<option>Trans-man</option>
							<option>Trans-woman</option>
							<option>Other</option>
						</select>
					</div>
				</div>
				{/* Introduction */}
				<div className="block">
					<label htmlFor="introduction" className="label my-3">
						Introduction *
					</label>
					<textarea
						id="introduction"
						className="textarea is-primary"
						rows={10}
						placeholder="Tell us about yourself"
						value={profile.introduction}
						onChange={(event) =>
							setProfile({
								...profile,
								introduction: event.target.value,
							})
						}
					></textarea>
				</div>
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
