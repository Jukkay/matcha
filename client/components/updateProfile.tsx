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
	Notification
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
	const [fileAmountError, setFileAmountError] = useState(false);
	const [textAreaError, setTextAreaError] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [imageAmount, setImageAmount] = useState(0);
	const [newProfileImage, setNewProfileImage] = useState(false);
	const [files, setFiles] = useState<FileList>();
	const [showGenericError, setShowGenericError] = useState(false);
	const [interests, setInterests] = useState<string[]>([]);
	const [query, setQuery] = useState('');
	const [result, setResult] = useState<string[]>([]);
	const { userData, updateUserData } = useUserContext();
	const [genericErrorMessage, setGenericErrorMessage] = useState('')

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	useEffect(() => {
		setInterests(profile.interests);
		setSuccess(false);
	}, [profile.interests]);

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
			if (profile.user_latitude && profile.user_longitude) {
				const latitudeTest =
					/^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/.test(
						profile.user_latitude.trim()
					);
				const longitudeTest =
					/^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/.test(
						profile.user_longitude.trim()
					);
				if (!latitudeTest || !longitudeTest) {
					setCoordinateError(true);
					return;
				} else {
					setProfile({
						...profile,
						user_latitude: profile.user_latitude.trim(),
						user_longitude: profile.user_longitude.trim(),
					});
				}
			}
			// Check interests amount
			if (interests?.length < 1) {
				setInterestsError(true);
				return;
			}
			// Check textarea length
			if (profile.introduction && profile.introduction.length > 4096) {
				setTextAreaError(true);
				return;
			}
			let payload = { ...profile };
			payload.interests = [...interests];
			payload.user_latitude = profile.user_latitude?.trim();
			payload.user_longitude = profile.user_longitude?.trim();
			payload.introduction = profile.introduction?.trim();
			payload.birthday = userData.birthday;
			payload.user_id = userData.user_id;
			// Update profile object with form data
			setProfile({ ...profile, interests: [...interests] });
			// Check photos
			if (files && files.length > 0) {
				if (files.length + imageAmount > 5) {
					setFileAmountError(true);
					return;
				}
				// upload photos
				const photoUpload = await uploadPhotos();
				if (!photoUpload) {
					setImageError(true);
					return;
				}

				// Get profile picture filename
				if (newProfileImage) {
					const profile_image: string =
						profile.profile_image === 'profile.svg'
							? photoUpload.data.filenames[0]
							: photoUpload.data.filenames[profile.profile_image];
					payload.profile_image = profile_image;
					setProfile({ ...profile, profile_image: profile_image });
				}
			}
			// Upload profile
			const response = await authAPI.patch(`/profile`, payload);
			if (response.status === 200) {
				setSuccess(true);
				setTimeout(() => {
					setSuccess(false);
					setEditMode(false);
				}, 2000);
			}
		} catch (err) { }
	};
	const deleteProfile = async () => {
		try {
			const response = await authAPI.delete(
				`/profile/${profile.user_id}`
			);
			if (response.status === 200) {
				setDeleted(true);
				setTimeout(() => {
					sessionStorage.removeItem('profile');
					setProfile({
						user_id: 0,
						name: '',
						birthday: '',
						profile_image: 'profile.svg',
						gender: '',
						looking: '',
						min_age: 0,
						max_age: 0,
						interests: [],
						introduction: '',
						country: '',
						city: '',
						latitude: '',
						longitude: '',
						user_latitude: '',
						user_longitude: '',
						famerating: 0,
					});
					updateUserData({ ...userData, profile_exists: false });
					setDeleted(false);
					setEditMode(false);
				}, 2000);
			}
		} catch (err: any) {
			const errorMessage = err.response?.data?.message;
			if (errorMessage) {
				setGenericErrorMessage(errorMessage)
				setShowGenericError(true);
			}
		}
	};
	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setShowGenericError(false);
		uploadProfile();
	};

	useEffect(() => {
		if (profile.introduction && profile.introduction.length > 4095)
			setTextAreaError(true);
		else setTextAreaError(false);
	}, [profile.introduction]);

	return deleted ? (
		<div className="my-6 pt-6 mx-3">
			<div className="card p-3 rounded-corners has-text-centered">
				<section className="section">
					<h3 className="title is-3">Profile deleted successfully</h3>
				</section>
			</div>
		</div>
	) : success ? (
		<div className="my-6 pt-6 mx-3">
			<div className="card p-3 rounded-corners has-text-centered">
				<section className="section">
					<h3 className="title is-3">Profile updated successfully</h3>
				</section>
			</div>
		</div>
	) : (
		<div className="my-6 mx-3">
			<section className="section">
				<form onSubmit={handleSubmit} acceptCharset="UTF-8">
					<h1 className="title is-1">Edit profile</h1>

					{/* Location. Components imported dynamically */}
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
						onChange={(event) =>
							setProfile({
								...profile,
								introduction: event.target.value,
							})
						}
					/>
					<ErrorMessage
						errorMessage={
							'Introduction maximum length is 4096 characters'
						}
						error={textAreaError}
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
					<EditGallery
						files={files}
						setImageError={setImageError}
						setImageAmount={setImageAmount}
					/>
					<ErrorMessage
						errorMessage="You must have at least one picture."
						error={imageError}
					/>
					<FileInput
						files={files}
						setFiles={setFiles}
						setFileAmountError={setFileAmountError}
						setFileError={setImageError}
						imageAmount={imageAmount}
						setNewProfileImage={setNewProfileImage}
					/>
					<ErrorMessage
						errorMessage="You may not upload more than 5 pictures."
						error={fileAmountError}
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
					<Notification
						notificationText={genericErrorMessage}
						notificationState={showGenericError}
						handleClick={() => setShowGenericError(false)}
					/>
				</form>
			</section>
			<section className="section">
				<p className="block">
					Caution: Removing profile is irreversible. If you remove
					your profile, you won&apos;t be able to use the site
					normally anymore unless you create a new profile. This
					action will not remove your whole account. If you wish to
					remove your account too, you can do that in User settings.
				</p>
				<button className="button is-danger" onClick={deleteProfile}>
					Remove profile
				</button>
			</section>
		</div>
	);
};

export const EditGallery = ({
	setImageError,
	setImageAmount,
}: GalleryProps) => {
	const [images, setImages] = useState<string[]>([]);
	const { userData, profile, setProfile } = useUserContext();

	// Remove uploaded image
	const handleClick = async (event: PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const url = event.currentTarget.id;
		if (images.length == 1) {
			setImageError(true);
			return;
		}
		const removedImage = url.substring(url.lastIndexOf('/') + 1);
		if (!removedImage) return;
		try {
			let response = await authAPI.delete(`/image/${removedImage}`);
			if (response.status === 200) {
				const newImages = images.filter((item) => item != url);
				setImages([...newImages]);
				setImageAmount(newImages.length);
			}
		} catch (err) { }
	};

	// Set as profile picture
	const handleProfilePicture = (event: PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const url = event.currentTarget.id;
		const chosenImage = url.substring(url.lastIndexOf('/') + 1);
		setProfile({ ...profile, profile_image: chosenImage });
	};

	useEffect(() => {
		const getUserImages = async () => {
			if (!userData.user_id) return;
			try {
				let response = await authAPI.get(
					`/image/user/${userData.user_id}`
				);
				if (response?.data?.photos) {
					const filenames = response.data.photos.map(
						(item: any) =>
							`${authAPI.defaults.baseURL}/images/${item['filename']}`
					);
					setImages(filenames);
					setImageAmount(filenames.length);
				}
			} catch (err) { }
		};
		getUserImages();
	}, [userData.user_id]);

	// Set first image in images as profile picture if the current is deleted
	useEffect(() => {
		const updateProfileImage = async (controller: AbortController) => {
			try {
				await authAPI.post(`/updateprofileimage`, {
					profile_image: filename,
					signal: controller.signal,
				});
			} catch (err) { }
		};
		if (images.length < 1) return;
		if (
			images.indexOf(
				`${authAPI.defaults.baseURL}/images/${profile.profile_image}`
			) > -1
		)
			return;
		const filename = images[0]?.substring(images[0].lastIndexOf('/') + 1);
		setProfile({
			...profile,
			profile_image: filename?.length > 0 ? filename : 'profile.svg',
		});

		// Update to database
		const controller = new AbortController();
		updateProfileImage(controller);
		return () => controller.abort();
	}, [images]);

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
									className="button is-small is-centered mt-3 is-primary is-outlined"
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
