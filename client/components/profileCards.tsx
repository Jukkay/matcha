import { authAPI } from '../utilities/api';
import { convertBirthdayToAge, reformatDateTime } from '../utilities/helpers';
import { Gallery, OnlineIndicator } from './profile';
import Link from 'next/link';
import { IProfileCard, OtherUserViewProps } from '../types/types';
import { useState } from 'react';
import { LikeButton, UnlikeButton } from './buttons';

export const SearchResultItemWithoutDistance = ({ profile }: any) => {
	return (
		<Link href={`/profile/${profile.user_id}`}>
			<a>
				<div className="my-6">
					<div className="columns card p-3 rounded-corners is-gapless">
						<div className="column is-two-thirds">
							<div className="image is-square rounded-corners">
								<img
									src={`${authAPI.defaults.baseURL}/images/${profile.profile_image}`}
									alt="Placeholder image"
									crossOrigin=""
									className="rounded-corners"
								/>
								<div className="is-overlay">
									<OnlineIndicator
										user_id={profile.user_id}
									/>
								</div>
							</div>
						</div>
						<div className="column m-3">
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
									? JSON.parse(profile.interests).map(
											(
												interest: string,
												index: number
											) => (
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
						</div>
					</div>
				</div>
			</a>
		</Link>
	);
};

export const SearchResultItem = ({
	user_id,
	profile_image,
	name,
	birthday,
	city,
	country,
	famerating,
	distance,
	interests,
}: IProfileCard) => {
	return (
		<Link href={`/profile/${user_id}`}>
			<a>
				<div className="my-6">
					<div className="columns card p-3 rounded-corners is-gapless">
						<div className="column is-two-thirds">
							<div className="image is-square rounded-corners">
								<img
									src={`${authAPI.defaults.baseURL}/images/${profile_image}`}
									alt="Placeholder image"
									crossOrigin=""
									className="rounded-corners"
								/>
								<div className="is-overlay">
									<OnlineIndicator user_id={user_id} />
								</div>
							</div>
						</div>
						<div className="column m-3">
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									Name:
								</span>
								{name}
							</div>
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									Age:
								</span>
								{birthday && convertBirthdayToAge(birthday)}
							</div>
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									Famerating:
								</span>
								{famerating}
							</div>
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									Distance:
								</span>
								{`${distance} km`}
							</div>
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									City:
								</span>
								{city}
							</div>
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									Country:
								</span>
								{country}
							</div>
							<div className="block">
								<span className="has-text-weight-semibold mr-3">
									Interests:
								</span>
								{interests
									? JSON.parse(interests).map(
											(
												interest: string,
												index: number
											) => (
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
						</div>
					</div>
				</div>
			</a>
		</Link>
	);
};

export const ProfileViewWithLikeButtons = ({
	otherUserProfile,
}: OtherUserViewProps) => {
	const [liked, setLiked] = useState(otherUserProfile.liked);
	const [match, setMatch] = useState(false);

	const closeNotification = () => {
		setMatch(false);
	};
	return (
		<div className="my-6 pt-6 mx-3">
			<div className="columns card p-3 is-gapless">
				<div className="column card-image has-text-left is-two-thirds">
					<Gallery user_id={otherUserProfile.user_id} />
				</div>
				<div className="column mt-3 has-text-left m-3">
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Name:
						</span>
						{otherUserProfile.name}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Age:
						</span>
						{otherUserProfile.birthday &&
							convertBirthdayToAge(otherUserProfile.birthday)}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Famerating:
						</span>
						{otherUserProfile.famerating}
					</div>

					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							City:
						</span>
						{otherUserProfile.city}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Country:
						</span>
						{otherUserProfile.country}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Interests:
						</span>
						{otherUserProfile.interests
							? otherUserProfile.interests.map(
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
							{otherUserProfile.introduction}
						</p>
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Gender:
						</span>
						{otherUserProfile.gender}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Looking for:
						</span>
						{otherUserProfile.looking}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Minimum age:
						</span>
						{otherUserProfile.min_age}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Maximum age:
						</span>
						{otherUserProfile.max_age}
					</div>
					<div className="block">
						<span className="has-text-weight-semibold mr-3">
							Last login:
						</span>
						{reformatDateTime(otherUserProfile.last_login)}
					</div>
					{match ? (
						<div className="notification is-primary">
							<button
								className="delete"
								onClick={closeNotification}
							></button>
							<h3 className="title is-3">It&apos;s a match!</h3>
						</div>
					) : null}
					{otherUserProfile.match_id ? (
						<div className="notification is-primary">
							<button
								className="delete"
								onClick={closeNotification}
							></button>
							<h3 className="title is-3">You&apos;re matched!</h3>
						</div>
					) : null}
					{otherUserProfile.likes_requester &&
					!otherUserProfile.match_id ? (
						<div className="notification is-primary is-light">
							<p className="is-3">{`${otherUserProfile.name} likes you. Like them back to match them!`}</p>
						</div>
					) : null}
					<div className="block buttons">
						{liked ? (
							<UnlikeButton
								otherUserProfile={otherUserProfile}
								setLiked={setLiked}
								setMatch={setMatch}
							/>
						) : (
							<LikeButton
								profile={otherUserProfile}
								setLiked={setLiked}
								setMatch={setMatch}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
