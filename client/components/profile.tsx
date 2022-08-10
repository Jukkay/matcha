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
} from '../types/types';
import { Country, City } from 'country-state-city';
import { ErrorMessage } from './form';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';

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
export const NewProfileButton = ({ setEditMode }: EditButtonProps) => {
	return (
		<button className="button is-primary" onClick={() => setEditMode(true)}>
			Create new profile
		</button>
	);
};

export const SaveButton = ({
	setEditMode,
	profile,
	interests,
}: SaveButtonProps) => {
	const handleClick = () => {
		// Add interests object to profile
		let payload = profile;
		payload.interests = Object.assign({}, interests);
		// Save inputs to db
		sessionStorage.setItem('profile', JSON.stringify(profile));
		setEditMode(false);
		authAPI.post('/profile', payload);
	};
	return (
		<button className="button is-primary" onClick={() => handleClick()}>
			Save profile
		</button>
	);
};

export const UpdateButton = ({
	setEditMode,
	profile,
	interests,
}: SaveButtonProps) => {
	const handleClick = () => {
		// Add interests object to profile
		let payload = profile;
		payload.interests = Object.assign({}, interests);
		// Save inputs to db
		sessionStorage.setItem('profile', JSON.stringify(profile));
		setEditMode(false);
		authAPI.patch('/profile', payload);
	};
	return (
		<button className="button is-primary" onClick={() => handleClick()}>
			Update profile
		</button>
	);
};

export const Tag = ({
	text,
	key,
	interests,
	setInterests,
	setTagError,
}: ITag) => {
	const [selected, setSelected] = useState(false);

	const handleTagClick = (event: PointerEvent<HTMLSpanElement>) => {
		setTagError(false);
		const interest = event.currentTarget.innerText;

		// // check if in array and remove if so
		// if (interests.includes(interest)) {
		// 	setInterests(interests.filter((item) => item !== interest));
		// 	setSelected(false);
		// 	return;
		// }
		// if array size is 5 show error message and return
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
			key={key}
			onClick={handleTagClick}
		>
			{text}
		</span>
	);
};

export const SelectedTag = ({
	text,
	key,
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
			key={key}
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
					key={interest.concat(index.toString())}
					interests={interests}
					setInterests={setInterests}
					setTagError={setTagError}
				/>
			))}
			{result.map((interest, index) =>
				interests.includes(interest) ? null : (
					<Tag
						text={interest}
						key={interest.concat(index.toString())}
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
						<option key={`${country.name}${index}`} value={country.isoCode}>
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
					{City.getCitiesOfCountry(profile.country)?.map((city, index) => (
						<option key={`${city.name}${index}`} value={city.name}>
							{city.name}
						</option>
					))}
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
			></textarea>
		</div>
	);
};

export const FileInput = ({ profileExists }: FileInputProps) => {
	const [files, setFiles] = useState<FileList>();
	const [preview, setPreview] = useState<string[]>([]);
	const [userImages, setUserImages] = useState<string[]>([]);
	const { userData } = useUserContext();

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return;
		setFiles(event.target.files);
	};
	const getImages = async () => {
		const response = await authAPI.get(`/image/user/${userData.user_id}`);
		console.log(response.data.photos);
	};

	useEffect(() => {
		if (!files || files.length < 1) return;
		let imageData = [];
		for (let i = 0; i < files.length; i++) {
			imageData.push(URL.createObjectURL(files[i]));
		}
		setPreview(imageData as never[]);
	}, [files]);

	useEffect(() => {
		getImages();
	}, [userImages]);

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
			<div className="block">
				<UploadButton
					files={files}
					setFiles={setFiles}
					setPreview={setPreview}
				/>
			</div>
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
export const UploadButton = ({ files, setFiles, setPreview }: IUpload) => {
	const [imageIDs, setImageIDs] = useState([]);
	const [images, setImages] = useState([]);

	const handleClick = async () => {
		console.log(files);
		if (!files || files.length < 1) return;
		// Add files to formData
		const imageData = new FormData();
		for (let i = 0; i < files.length; i++) {
			imageData.append('files', files[i], files[i].name);
		}

		for (var pair of imageData.entries()) {
			console.log(pair[0] + ', ' + pair[1]);
		}
		// Upload to browser
		const response = await authAPI.post('/image', imageData);
		console.log(response.data.photo_IDs);
		setImageIDs(response.data.photo_IDs);
		setFiles([]);
		setPreview([]);
	};

	return (
		<button className="button is-primary" onClick={handleClick}>
			Upload pictures
		</button>
	);
};
