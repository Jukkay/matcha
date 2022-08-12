import React, {
	useState,
	PointerEvent,
	useEffect,
	SetStateAction,
} from 'react';
import { FaUpload } from 'react-icons/fa';

import {
	EditProps,
	ITag,
	ISearchResult,
	ISelector,
	ISelectorProfile,
	ITextArea,
	IThumbnails,
	IUpload,
	EditButtonProps,
	ViewProps,
	SaveButtonProps,
	ProfileViewProps,
	FileInputProps,
	GalleryProps,
	UserImagesProps,
	SearchProps,
	AgeRangeProps,
} from '../types/types';
import { Country, City } from 'country-state-city';
import { ErrorMessage } from './form';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';
import axios from 'axios';
import { dummyData } from '../pages/profile/data';

export const LikeButton = () => {
	return (
		<button className="button">
			<span className="icon is-small">
				<i className="fas fa-bold"></i>
			</span>
		</button>
	);
};

export const EditButton = ({ setEditMode }: EditButtonProps) => {
	return (
		<button className="button is-primary" onClick={() => setEditMode(true)}>
			Edit profile
		</button>
	);
};

export const ProfileView = ({ profile, setEditMode }: ProfileViewProps) => {
	const { userData } = useUserContext();
	return (
		<div>
			<section className="section">
				<Gallery user_id={userData.user_id} />
				<div className="block">Name: {userData.name}</div>
				<div className="block">Age: {userData.age}</div>
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
				<EditButton setEditMode={setEditMode} />
			</section>
		</div>
	);
};

export const CreateProfile = ({
	setEditMode,
	profile,
	setProfile,
	profileExists,
	setProfileExists,
}: EditProps) => {
	const [tagError, setTagError] = useState(false);
	const [interestsError, setInterestsError] = useState(false);
	const [fileError, setFileError] = useState(false);
	const [files, setFiles] = useState<FileList>();
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};
	useEffect(() => {
		setInterests(Object.values(profile.interests));
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
		// Check photos
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
			// upload photos
			const photoUpload = await uploadPhotos();
			if (!photoUpload) {
				setFileError(true);
				return;
			}

			// Check interests amount
			if (interests.length < 1) {
				setInterestsError(true);
				return;
			}
			// Add interests object to profile
			let payload = profile;
			payload.interests = Object.assign({}, interests);
			// Save inputs to db
			sessionStorage.setItem('profile', JSON.stringify(profile));
			setEditMode(false);
			await authAPI.post(`/profile`, payload);
			setProfileExists(true);
		} catch (err) {
			console.error(err);
		}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		uploadProfile();
	};
	return (
		<div>
			<form onSubmit={handleSubmit}>
				<section className="section">
					<h3 className="title is-3">Create new profile</h3>

					{/* Location */}
					<CountrySelector
						profile={profile}
						setProfile={setProfile}
					/>
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
					<FileInput
						profileExists={profileExists}
						files={files}
						setFiles={setFiles}
					/>
					<ErrorMessage
						errorMessage="You must upload at least one picture."
						error={fileError}
					/>

					<h3 className="title is-3 mt-6">
						What kind of partner are you looking for?
					</h3>
					{/* Looking For */}
					<GenderSelector
						label="Gender *"
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
					<button type="submit" className="button is-primary">
						Save profile
					</button>
				</section>
			</form>
		</div>
	);
};

export const UpdateProfile = ({
	setEditMode,
	profile,
	setProfile,
	profileExists,
	setProfileExists,
}: EditProps) => {
	const [tagError, setTagError] = useState(false);
	const [interestsError, setInterestsError] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [files, setFiles] = useState<FileList>();
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};
	useEffect(() => {
		setInterests(Object.values(profile.interests));
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
		// Check photos
		if (!files || files.length < 1) {
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
			// upload photos
			await uploadPhotos();

			// Check interests amount
			if (interests.length < 1) {
				setInterestsError(true);
				return;
			}
			// Add interests object to profile
			let payload = profile;
			payload.interests = Object.assign({}, interests);
			// Save inputs to db
			sessionStorage.setItem('profile', JSON.stringify(profile));
			setEditMode(false);
			await authAPI.patch(`/profile`, payload);
			setProfileExists(true);
		} catch (err) {
			console.error(err);
		}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		uploadProfile();
	};
	return (
		<div>
			<form onSubmit={handleSubmit}>
				<section className="section">
					<h3 className="title is-3">Edit profile</h3>

					{/* Location */}
					<CountrySelector
						profile={profile}
						setProfile={setProfile}
					/>
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
					{/* Pictures */}
					<EditGallery files={files} setImageError={setImageError} />
					<ErrorMessage
						errorMessage="You must have at least one picture."
						error={imageError}
					/>
					<FileInput
						profileExists={profileExists}
						files={files}
						setFiles={setFiles}
					/>

					<h3 className="title is-3 mt-6">
						What kind of partner are you looking for?
					</h3>
					{/* Looking For */}
					<GenderSelector
						label="Gender *"
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
					<button type="submit" className="button is-primary">
						Update profile
					</button>
				</section>
			</form>
		</div>
	);
};

export const NewProfileButton = ({ setEditMode }: EditButtonProps) => {
	return (
		<div className="section has-text-centered">
			<h3 className="title is-3">
				Before we start, let's create a profile for you!
			</h3>
			<button
				className="button is-primary"
				onClick={() => setEditMode(true)}
			>
				Create new profile
			</button>
		</div>
	);
};

export const Tag = ({
	text,
	keyValue,
	interests,
	setInterests,
	setTagError,
}: ITag) => {
	const [selected, setSelected] = useState(false);

	const handleTagClick = (event: PointerEvent<HTMLSpanElement>) => {
		setTagError(false);
		const interest = event.currentTarget.innerText;

		if (interests.length >= 5) {
			setTagError(true);
			return;
		}
		// push to array
		setInterests([...interests, interest]);
		setSelected(!selected);
	};

	return (
		<span
			className="tag is-success is-light is-medium is-rounded is-clickable"
			key={keyValue}
			onClick={handleTagClick}
		>
			{text}
		</span>
	);
};

export const SelectedTag = ({
	text,
	keyValue,
	interests,
	setInterests,
	setTagError,
}: ITag) => {
	const [selected, setSelected] = useState(true);

	const handleTagClick = (event: PointerEvent<HTMLSpanElement>) => {
		setTagError(false);
		const interest = event.currentTarget.innerText;
		setInterests(interests.filter((item) => item !== interest));
		setSelected(!selected);
	};

	return (
		<span
			className="tag is-primary is-medium is-rounded is-clickable"
			key={keyValue}
			onClick={handleTagClick}
		>
			{text}
		</span>
	);
};

export const SearchResult = ({
	result,
	interests,
	setInterests,
	setTagError,
	query,
}: ISearchResult) => {
	return (
		<div className="tags" id="interests">
			{interests.map((interest, index) => (
				<SelectedTag
					text={interest}
					keyValue={'selected'.concat(
						interest.concat(index.toString())
					)}
					interests={interests}
					setInterests={setInterests}
					setTagError={setTagError}
				/>
			))}
			{result.map((interest, index) =>
				interests.includes(interest) ? null : (
					<Tag
						text={interest}
						keyValue={'not'.concat(
							interest.concat(index.toString())
						)}
						interests={interests}
						setInterests={setInterests}
						setTagError={setTagError}
					/>
				)
			)}
		</div>
	);
};

export const CountrySelector = ({ profile, setProfile }: ISelectorProfile) => {
	return (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				Country *
			</label>
			<div className="select is-primary">
				<select
					id="country"
					name="country"
					value={profile.country}
					onChange={(event) =>
						setProfile({
							...profile,
							country: event.target.value,
						})
					}
					required
				>
					<option value={''} disabled>
						Choose your country
					</option>
					{Country.getAllCountries().map((country, index) => (
						<option
							key={`${country.name}${index}`}
							value={country.isoCode}
						>
							{country.name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export const CitySelector = ({ profile, setProfile }: ISelectorProfile) => {
	return profile.country ? (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				City *
			</label>
			<div className="select is-primary">
				<select
					id="city"
					name="city"
					value={profile.city}
					onChange={(event) =>
						setProfile({
							...profile,
							city: event.target.value,
						})
					}
					required
				>
					<option value={''} disabled>
						Choose your city
					</option>
					{City.getCitiesOfCountry(profile.country)?.map(
						(city, index) => (
							<option
								key={`${city.name}${index}`}
								value={city.name}
							>
								{city.name}
							</option>
						)
					)}
				</select>
			</div>
		</div>
	) : (
		<div className="block">
			<label htmlFor="county" className="label my-3">
				City *
			</label>
			<div className="select is-primary disabled">
				<select
					id="city"
					value={profile?.city}
					onChange={(event) =>
						setProfile({
							...profile,
							city: event.target.value,
						})
					}
					required
				>
					<option value={''} disabled>
						Choose your city
					</option>
				</select>
			</div>
		</div>
	);
};

export const AgeRange = ({ profile, setProfile }: ISelectorProfile) => {
	return (
		<div className="block">
			<label htmlFor="min_age" className="label">
				Age range *
			</label>

			<div className="field is-horizontal">
				<div className="field-label is-normal">
					<label htmlFor="min_age" className="label">
						Min
					</label>
				</div>
				<div className="field-body">
					<div className="field">
						<input
							type="number"
							id="min_age"
							className="input is-primary"
							min="18"
							max={profile?.max_age}
							value={profile?.min_age}
							onChange={(event) =>
								setProfile({
									...profile,
									min_age: parseInt(event.target.value),
								})
							}
						/>
					</div>
					<div className="field-label is-normal">
						<label htmlFor="max_age" className="label">
							Max
						</label>
					</div>
					<div className="field">
						<input
							type="number"
							id="max_age"
							className="input is-primary"
							min={profile?.min_age}
							max="122"
							value={profile?.max_age}
							onChange={(event) =>
								setProfile({
									...profile,
									max_age: parseInt(event.target.value),
								})
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export const SearchAgeRange = ({ searchParams, setSearchParams }: AgeRangeProps) => {
	return (
		<div className="block">
			<label htmlFor="min_age" className="label">
				Age range *
			</label>

			<div className="field is-horizontal">
				<div className="field-label is-normal">
					<label htmlFor="min_age" className="label">
						Min
					</label>
				</div>
				<div className="field-body">
					<div className="field">
						<input
							type="number"
							id="min_age"
							className="input is-primary"
							min="18"
							max={searchParams?.max_age}
							value={searchParams?.min_age}
							onChange={(event) =>
								setSearchParams({
									...searchParams,
									min_age: parseInt(event.target.value),
								})
							}
						/>
					</div>
					<div className="field-label is-normal">
						<label htmlFor="max_age" className="label">
							Max
						</label>
					</div>
					<div className="field">
						<input
							type="number"
							id="max_age"
							className="input is-primary"
							min={searchParams?.min_age}
							max="122"
							value={searchParams?.max_age}
							onChange={(event) =>
								setSearchParams({
									...searchParams,
									max_age: parseInt(event.target.value),
								})
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export const GenderSelector = ({
	label,
	id,
	value,
	placeholder,
	onChange,
	options,
}: ISelector) => {
	return (
		<div className="block">
			<label htmlFor={id} className="label my-3">
				{label}
			</label>
			<div className="select is-primary">
				<select id={id} value={value} onChange={onChange} required>
					<option value={''} disabled>
						{placeholder}
					</option>
					{options?.map((item) => (
						<option key={item} value={item}>
							{item}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export const TextArea = ({
	label,
	id,
	value,
	placeholder,
	onChange,
	size,
}: ITextArea) => {
	return (
		<div className="block">
			<label htmlFor={id} className="label my-3">
				{label}
			</label>
			<textarea
				id={id}
				className="textarea is-primary"
				rows={size}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				required
			></textarea>
		</div>
	);
};
export const EditGallery = ({ files, setImageError }: GalleryProps) => {
	const [images, setImages] = useState([]);
	const { userData } = useUserContext();

	// Remove uploaded image
	const handleClick = async (event: PointerEvent<HTMLButtonElement>) => {
		if (images.length < 2) {
			setImageError(true)
			return
		}
		const removedImage = event.currentTarget.id.split('/').pop();
		if (!removedImage) return;
		let response = await authAPI.delete(`/image/${removedImage}`);
		if (response.status === 200) {
			const newImages = images.filter((item) => item != removedImage);
			setImages(newImages);
		}
	};

	useEffect(() => {
		const getUserImages = async () => {
			let response = await authAPI.get(`/image/user/${userData.user_id}`);
			if (response?.data?.photos) {
				const filenames = response.data.photos.map(
					(item: any) =>
						`${authAPI.defaults.baseURL}/images/${item['filename']}`
				);
				setImages(filenames);
			}
		};
		getUserImages();
	}, [files]);

	return images ? (
		<div className="block">
			<label htmlFor="gallery" className="label my-3">
				Uploaded images:
			</label>
			<div className="is-flex is-flex-direction-row is-flex-wrap-wrap">
				{images.map((image) => (
					<div key={image} className="box mx-3 has-text-centered">
						<figure className="image is-128x128">
							<img
								src={image}
								alt="Placeholder image"
								crossOrigin=""
							/>
						</figure>
						<button
							className="button is-small is-centered mt-3"
							id={image}
							onClick={handleClick}
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</div>
	) : null;
};

export const Gallery = ({user_id}: UserImagesProps) => {

	const [images, setImages] = useState([]);

	useEffect(() => {
		const getUserImages = async () => {
			let response = await authAPI.get(`/image/user/${user_id}`);
			if (response?.data?.photos) {
				const filenames = response.data.photos.map(
					(item: any) =>
						`${authAPI.defaults.baseURL}/images/${item['filename']}`
				);
				setImages(filenames);
			}
		};
		getUserImages();
	}, []);

	return images && user_id ? (
		<div className="block">
			<div className="is-flex is-flex-direction-row is-flex-wrap-wrap">
				{images.map((image) => (
					<div key={image} className="box mx-3 has-text-centered">
						<figure className="image is-128x128">
							<img
								src={image}
								alt="Placeholder image"
								crossOrigin=""
							/>
						</figure>
					</div>
				))}
			</div>
		</div>
	) : null;
};

export const FileInput = ({
	profileExists,
	files,
	setFiles,
}: FileInputProps) => {
	const [preview, setPreview] = useState<string[]>([]);
	const [userImages, setUserImages] = useState<string[]>([]);
	const { userData } = useUserContext();

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setFiles(event.target.files);
	};

	useEffect(() => {
		if (!files || files.length < 1) return;
		let imageData = [];
		for (let i = 0; i < files.length; i++) {
			imageData.push(URL.createObjectURL(files[i]));
		}
		setPreview(imageData as never[]);
	}, [files]);

	return (
		<div>
			<div className="block">
				<label htmlFor="upload" className="label my-3">
					Upload pictures *
				</label>
				<div className="file">
					<label className="file-label">
						<input
							className="file-input"
							type="file"
							name="upload"
							onChange={onChange}
							accept="image/*"
							multiple
						/>
						<span className="file-cta">
							<span className="file-icon">
								<FaUpload />
							</span>
							<span className="file-label">
								Choose files to upload
							</span>
						</span>
					</label>
				</div>
			</div>
			<Thumbnails preview={preview} setPreview={setPreview} />
		</div>
	);
};

export const Thumbnails = ({ preview, setPreview }: IThumbnails) => {
	// Remove uploaded image
	const handleClick = (event: PointerEvent<HTMLButtonElement>) => {
		const removedImage = event.currentTarget.id;
		const newPreview = preview.filter((item) => item != removedImage);
		setPreview(newPreview);
	};

	return preview ? (
		<div className="block">
			<div className="is-flex is-flex-direction-row is-flex-wrap-wrap">
				{preview.map((image) => (
					<div key={image} className="box mx-3 has-text-centered">
						<figure className="image is-128x128">
							<img src={image} alt="Placeholder image" />
						</figure>
						<button
							type="button"
							className="button is-small is-danger is-centered mt-3"
							id={image}
							onClick={handleClick}
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</div>
	) : null;
};
// export const UploadButton = ({ files, setFiles, setPreview }: IUpload) => {
// 	const [imageIDs, setImageIDs] = useState([]);
// 	const [images, setImages] = useState([]);

// 	const handleClick = async () => {
// 		if (!files || files.length < 1) return;

// 		// Add files to formData
// 		const imageData = new FormData();
// 		for (let i = 0; i < files.length; i++) {
// 			imageData.append('files', files[i], files[i].name);
// 		}

// 		// Upload to browser
// 		const response = await authAPI.post('/image', imageData);
// 		setImageIDs(response.data.photo_IDs);
// 		setFiles([]);
// 		setPreview([]);
// 	};

// 	return (
// 		<div className="button is-primary" onClick={handleClick}>
// 			Upload pictures
// 		</div>
// 	);
// };
