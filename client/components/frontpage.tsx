import { useEffect, useState } from 'react';
import { LoadStatus, ResultProfiles, ResultsProps } from '../types/types';
import { authAPI } from '../utilities/api';

import { LoadError, Spinner } from './utilities';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Lazy } from 'swiper';
import 'swiper/css/lazy';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import {
	highFameratingFirst,
	moreCommonTagsFirst,
	nearFirst,
} from '../utilities/sort';
import { convertBirthdayToAge } from '../utilities/helpers';
import Link from 'next/link';

export const Recommendations = ({
	sortedResults,
	loadStatus,
}: ResultsProps) => {
	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profiles" />;
	const profiles = sortedResults.slice(0, 10);
	return <ProfileCarousel profiles={profiles} />;
};

export const ClosestList = ({ sortedResults, loadStatus }: ResultsProps) => {
	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profiles" />;
	const sortedByDistance = nearFirst(sortedResults);
	const profiles = sortedByDistance.slice(0, 10);
	return <ProfileCarousel profiles={profiles} />;
};

export const CommonInterestsList = ({
	sortedResults,
	loadStatus,
}: ResultsProps) => {
	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profiles" />;
	const sortedByInterests = moreCommonTagsFirst(sortedResults);
	const profiles = sortedByInterests.slice(0, 10);
	return <ProfileCarousel profiles={profiles} />;
};

export const FameratingList = ({ sortedResults, loadStatus }: ResultsProps) => {
	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profiles" />;
	const sortedByFamerating = highFameratingFirst(sortedResults);
	const profiles = sortedByFamerating.slice(0, 10);
	return <ProfileCarousel profiles={profiles} />;
};

export const RandomList = ({ sortedResults, loadStatus }: ResultsProps) => {
	if (loadStatus == LoadStatus.LOADING) return <Spinner />;
	if (loadStatus == LoadStatus.ERROR)
		return <LoadError text="Error loading profiles" />;
	const profiles = [...sortedResults]
		.sort(() => 0.5 - Math.random())
		.slice(0, 10);
	return <ProfileCarousel profiles={profiles} />;
};

export const ProfileCarousel = ({ profiles }: ResultProfiles) => {
	const [images, setImages] = useState<string[]>([]);

	useEffect(() => {
		const urls = profiles.map(
			(item: any) =>
				`${authAPI.defaults.baseURL}/images/${item['profile_image']}`
		);
		setImages(urls);
	}, []);

	return images.length > 0 ? (
		<Swiper
			spaceBetween={30}
			lazy={true}
			pagination={{
				dynamicBullets: true,
			}}
			navigation={true}
			modules={[Pagination, Navigation, Lazy]}
			className="swiper"
			breakpoints={{
				0: {
					slidesPerView: 3,
				},
				960: {
					slidesPerView: 4,
				},
				1200: {
					slidesPerView: 5,
				},
			  }}
		>
			{images.map((image, index) => (
				<SwiperSlide className="swiper-slide" key={index}>
					<Link href={`/profile/${profiles[index].user_id}`}>
					<a>

					<div className="is-relative image is-square rounded-corners">
						<img
							src={image}
							alt="Placeholder image"
							crossOrigin=""
							className="rounded-corners"
							/>
						<p className="is-overlay has-text-weight-bold has-text-white mt-3 ml-3">{`${profiles[index].name}, ${convertBirthdayToAge(profiles[index].birthday)}`}</p>
					</div>
							</a>
							</Link>
				</SwiperSlide>
			))}
		</Swiper>
	) : null;
};
