import { useEffect, useState, PointerEvent } from 'react';
import { dummyData } from './data';
import { EditProps, GalleryProps } from '../types/types';
import { authAPI } from '../utilities/api';
import {
	AgeRange,
	ErrorMessage,
	GenderSelector,
	GPSCoordinateInput,
	LookingSelector,
	TextArea,
} from './form';
import { FileInput, SearchResult } from './profile';
import { useUserContext } from './UserContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically imported components
const CitySelector = dynamic(() => import('./profileLocationSelectors'), {
	suspense: true,
});
const CountrySelector = dynamic(() => import('./profileLocationSelectors'), {
	suspense: true,
});

// Profile update page component
export const UpdateProfile = ({
	setEditMode,
	profile,
	setProfile,
}: EditProps) => {
	const [tagError, setTagError] = useState(false);
	const [success, setSuccess] = useState(false);
	const [deleted, setDeleted] = useState(false);
	const [interestsError, setInterestsError] = useState(false);
	const [coordinateError, setCoordinateError] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [files, setFiles] = useState<FileList>();
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);
	const { userData, updateUserData } = useUserContext();

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	useEffect(() => {
		setInterests(profile.interests);
		setSuccess(false);
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
			if (profile.latitude && profile.longitude) {
				const latitudeTest =
					/^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/.test(
						profile.latitude
					);
				const longitudeTest =
					/^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/.test(
						profile.longitude
					);
				if (!latitudeTest || !longitudeTest) {
					setCoordinateError(true);
					return;
				}
			}
			// Check interests amount
			if (interests?.length < 1) {
				setInterestsError(true);
				return;
			}
			// Check photos
			if (files && files.length > 0) {
				// upload photos
				await uploadPhotos();
			}
			// Add interests object to profile
			let payload = profile;
			payload.interests = interests;
			// Add other information user can't change
			payload.birthday = userData.birthday;
			payload.name = userData.name;
			// Upload profile
			const response = await authAPI.patch(`/profile`, payload);
			if (response.status === 200) {
				setSuccess(true);
				setTimeout(() => {
					setSuccess(false);
					setEditMode(false);
					sessionStorage.setItem('profile', JSON.stringify(payload));
				}, 2000);
			}
		} catch (err) {
			console.error(err);
		}
	};
	const deleteProfile = async () => {
		const response = await authAPI.delete(`/profile/${profile.user_id}`);
		if (response.status === 200) {
			setDeleted(true);
			setTimeout(() => {
				updateUserData({ ...userData, profile_exists: false });
				setDeleted(false);
				setEditMode(false);
				sessionStorage.removeItem('profile');
			}, 2000);
		}
	};
	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		uploadProfile();
	};
	return deleted ? (
		<section className="section">
			<div className="box has-text-centered">
				<section className="section">
					<h3 className="title is-3">Profile deleted successfully</h3>
				</section>
			</div>
		</section>
	) : success ? (
		<section className="section">
			<div className="box has-text-centered">
				<section className="section">
					<h3 className="title is-3">Profile updated successfully</h3>
				</section>
			</div>
		</section>
	) : (
		<div>
			<form onSubmit={handleSubmit}>
				<section className="section">
					<h3 className="title is-3">Edit profile</h3>

					{/* Location. Components imported lazyly*/}
					<Suspense fallback={`Loading...`}>
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
					<FileInput files={files} setFiles={setFiles} />

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

					{/* User coordinate input */}
					<GPSCoordinateInput
						profile={profile}
						setProfile={setProfile}
					/>
					<ErrorMessage
						errorMessage="Invalid coordinates."
						error={coordinateError}
					/>
					<div className="block buttons">
						<button type="submit" className="button is-primary">
							Update profile
						</button>
						<button
							className="button is-primary"
							onClick={() => setEditMode(false)}
						>
							Cancel
						</button>
					</div>
				</section>
			</form>

			<section className="section">
				<p className="block">
					Caution: Removing profile is irreversible. If you remove
					your profile, you won't be able to use the site normally
					anymore unless you create a new profile. This action will
					not remove your whole account. If you wish to remove your
					account too, you can do that in User settings.
				</p>
				<button className="button is-danger" onClick={deleteProfile}>
					Remove profile
				</button>
			</section>
		</div>
	);
};

export const EditGallery = ({ files, setImageError }: GalleryProps) => {
	const [images, setImages] = useState<string[]>([]);
	const { userData, updateUserData, profile, setProfile } = useUserContext();

	// Remove uploaded image
	const handleClick = async (event: PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		if (images.length < 2) {
			setImageError(true);
			return;
		}
		const url = event.currentTarget.id;
		const removedImage = url.substring(url.lastIndexOf('/') + 1);
		if (!removedImage) return;
		if (removedImage == profile.profile_image) {
			setProfile({
				...profile,
				profile_image: images[0].substring(url.lastIndexOf('/') + 1),
			});
			updateUserData({
				...userData,
				profile_image: images[0].substring(url.lastIndexOf('/') + 1),
			});
		}
		let response = await authAPI.delete(`/image/${removedImage}`);
		if (response.status === 200) {
			const newImages = images.filter((item) => item != url);
			setImages([...newImages]);
		}
	};

	// Set as profile picture
	const handleProfilePicture = (event: PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const url = event.currentTarget.id;
		const chosenImage = url.substring(url.lastIndexOf('/') + 1);
		setProfile({ ...profile, profile_image: chosenImage });
		updateUserData({ ...userData, profile_image: chosenImage });
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
	}, []);

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
						<div className="buttons">
							<button
								className="button is-small is-danger is-centered mt-3"
								id={image}
								onClick={handleClick}
							>
								Remove
							</button>
							{profile.profile_image ==
							image.substring(image.lastIndexOf('/') + 1) ? (
								<button
									className="button is-small is-centered mt-3"
									id={image}
									onClick={handleProfilePicture}
								>
									Current profile picture
								</button>
							) : (
								<button
									className="button is-small is-primary is-centered mt-3"
									id={image}
									onClick={handleProfilePicture}
								>
									Set as profile picture
								</button>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	) : null;
};
