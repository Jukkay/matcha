import React, { useState, PointerEvent, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import {
	ITag,
	ISearchResult,
	IThumbnails,
	EditButtonProps,
	ProfileViewProps,
	FileInputProps,
	IProfileCard,
	OnlineStatusProps,
} from '../types/types';
import { EditButton } from './form';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';
import { convertBirthdayToAge } from '../utilities/helpers';
import { SearchResultItem } from './search';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Lazy, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { socket } from './SocketContext';
import { useInView } from 'react-intersection-observer';
import { Spinner } from './utilities';

export const ProfileView = ({ profile, setEditMode }: ProfileViewProps) => {
	const { userData } = useUserContext();
	return (
		<div className="my-6">
			<h1 className="title is-1">Your profile</h1>
			<div className="columns card my-6 rounded-corners">
				<div className="column has-text-left is-two-thirds">
					<Gallery user_id={userData.user_id} />
				</div>
				<div className="column mt-3 has-text-left m-3">
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Name:
						</span>
						{profile.name}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Age:
						</span>
						{profile.birthday &&
							convertBirthdayToAge(profile.birthday)}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Famerating:
						</span>
						{profile.famerating}
					</div>

					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							City:
						</span>
						{profile.city}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Country:
						</span>
						{profile.country}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Interests:
						</span>
						{profile.interests
							? profile.interests.map(
									(interest: string, index: number) => (
										<span
											className="tag is-primary mx-2 my-1"
											key={index}
										>
											{interest}
										</span>
									)
							  )
							: null}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Introduction:
						</span>
						<p className="notification has-background-primary-light">
							{profile.introduction}
						</p>
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Gender:
						</span>
						{profile.gender}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Looking for:
						</span>
						{profile.looking}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Minimum age:
						</span>
						{profile.min_age}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Maximum age:
						</span>
						{profile.max_age}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Latitude:
						</span>
						{profile.latitude}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Longitude:
						</span>
						{profile.longitude}
					</div>
					<EditButton setEditMode={setEditMode} />
				</div>
			</div>
			<VisitorLog user_id={userData.user_id} />
		</div>
	);
};

export const VisitorLog = ({ user_id }: any) => {
	const [pageVisited, setPageVisited] = useState(false);
	const [log, setLog] = useState([]);
	const [endIndex, setEndIndex] = useState(9);

	// Infinite scroll hooks
	const { ref, inView } = useInView({
		threshold: 0,
	});
	useEffect(() => {
		if (inView) {
			setEndIndex((endIndex) => endIndex + 10);
		}
	}, [inView]);

	useEffect(() => {
		const getVisitorLog = async () => {
			let response = await authAPI.get(`/log/${user_id}`);
			if (response.status === 200) {
				setPageVisited(true);
				setLog(response.data.log);
			}
		};
		getVisitorLog();
	}, []);

	return pageVisited && log ? (
		<section className="section">
			<h3 className="title is-3">Visitor log</h3>
			<div className="block">
				{log
						.slice(0, endIndex)
						.map((result: IProfileCard, index) => (
							<SearchResultItem
								key={index}
								user_id={result.user_id}
								profile_image={result.profile_image}
								name={result.name}
								birthday={result.birthday}
								city={result.city}
								country={result.country}
								famerating={result.famerating}
								distance={result.distance}
								interests={result.interests}
							/>
						))}
				{endIndex < log.length ? (
					<div ref={ref}>
						<Spinner />
					</div>
				) : (
					<section className="section has-text-centered">
						<h3 className="title is-3">
							No more matching profiles
						</h3>
					</section>
				)}
			</div>
		</section>
	) : (
		<section className="section">
			<h3 className="title is-3">Visitor log</h3>
			<div className="block">No visits yet</div>
		</section>
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

export const Tag = ({ text, interests, setInterests, setTagError }: ITag) => {
	const [selected, setSelected] = useState(false);

	const handleTagClick = (event: PointerEvent<HTMLSpanElement>) => {
		setTagError(false);
		const interest = event.currentTarget.innerText;

		if (interests?.length >= 5) {
			setTagError(true);
			return;
		}
		// push to array
		setInterests([...interests, interest]);
		setSelected(!selected);
	};

	return (
		<span
			className="tag is-primary is-light is-clickable"
			onClick={handleTagClick}
		>
			{text}
		</span>
	);
};

export const SelectedTag = ({
	text,
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
		<span className="tag is-primary is-clickable" onClick={handleTagClick}>
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
	return interests ? (
		<div className="tags" id="interests">
			{interests.map((interest, index) => (
				<SelectedTag
					key={'selected'.concat(interest.concat(index.toString()))}
					text={interest}
					interests={interests}
					setInterests={setInterests}
					setTagError={setTagError}
				/>
			))}
			{result.map((interest, index) =>
				interests.includes(interest) ? null : (
					<Tag
						text={interest}
						key={'selected'.concat(
							interest.concat(index.toString())
						)}
						interests={interests}
						setInterests={setInterests}
						setTagError={setTagError}
					/>
				)
			)}
		</div>
	) : null;
};

export const Gallery = ({ user_id }: OnlineStatusProps) => {
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
		<div>
			<Swiper
				slidesPerView={1}
				spaceBetween={30}
				lazy={true}
				pagination={{
					dynamicBullets: true,
				}}
				navigation={true}
				modules={[Pagination, Navigation, Lazy]}
			>
				{images.map((image, index) => (
					<SwiperSlide className="swiper-slide" key={index}>
						<div className="image is-square rounded-corners">
							<img
								src={image}
								alt="Placeholder image"
								className="rounded-corners fullwidth"
								crossOrigin=""
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			<div className="is-overlay">
				<OnlineIndicator user_id={user_id} />
			</div>
		</div>
	) : null;
};

export const FileInput = ({ files, setFiles }: FileInputProps) => {
	const [preview, setPreview] = useState<string[]>([]);

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
	const { userData, updateUserData, profile, setProfile } = useUserContext();
	// Remove uploaded image
	const handleRemove = (event: PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const removedImage = event.currentTarget.id;
		const newPreview = preview.filter((item) => item != removedImage);
		setPreview(newPreview);
	};
	// Set as profile picture
	const handleProfilePicture = (event: PointerEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const imageNumber = event.currentTarget.id;
		setProfile({ ...profile, profile_image: imageNumber });
	};

	return preview ? (
		<div className="block">
			<div className="is-flex is-flex-direction-row is-flex-wrap-wrap">
				{preview.map((image, index) => (
					<div key={image} className="box mx-3 has-text-centered">
						<figure className="image is-128x128">
							<img src={image} alt="Placeholder image" />
						</figure>
						<button
							type="button"
							className="button is-small is-danger is-centered mr-3 mt-3"
							id={image}
							onClick={handleRemove}
						>
							Remove
						</button>
						{}
						<button
							type="button"
							className="button is-small is-primary is-centered mt-3"
							id={index.toString()}
							onClick={handleProfilePicture}
						>
							Set as profile picture
						</button>
					</div>
				))}
			</div>
		</div>
	) : null;
};

export const OnlineIndicator = ({ user_id }: OnlineStatusProps) => {
	const [online, setOnline] = useState(false);
	// const socket = useSocketContext();

	// Query online status and listen for response
	useEffect(() => {
		try {
			socket.on('online_response', (data) => {
				if (data.queried_id === user_id) setOnline(data.online);
			});
			socket.emit('online_query', user_id);
			return () => {
				socket.removeAllListeners('online_response');
			};
		} catch (err) {
			console.error(err);
		}
	}, []);

	return online ? (
		<span className="tag is-primary online-indicator mt-5 ml-5">
			Online
		</span>
	) : (
		<span className="tag is-danger online-indicator mt-5 ml-5">
			Offline
		</span>
	);
};
