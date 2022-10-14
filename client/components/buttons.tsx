import { FcDislike, FcLike } from 'react-icons/fc';
import {
	ButtonsProps,
	EditButtonProps,
	IButton,
	LikeButtonProps,
	NotificationType,
	UnlikeButtonProps,
} from '../types/types';
import { authAPI } from '../utilities/api';
import { socket } from './socket';
import { useUserContext } from './UserContext';

export const LikeButton = ({
	profile,
	setLiked,
	setMatch,
}: LikeButtonProps) => {
	const { userData } = useUserContext();

	const likeProfile = async () => {
		const liked = profile.user_id;
		const liker = userData.user_id;
		try {
			const response = await authAPI.post('/like', {
				liker: liker,
				liked: liked,
			});

			if (response.status === 200) {
				// Emit notification
				const notification = {
					sender_id: liker,
					receiver_id: liked,
					notification_type: NotificationType.LIKE,
					notification_text: `Somebody liked you!`,
					link: `/profile/${liker}`,
				};
				if (socket.disconnected)
					socket.open()
				socket.emit('send_notification', liked, notification);
				// Send match notification
				if (response.data.match) {
					setMatch(true);
					const notification = {
						sender_id: liker,
						receiver_id: liked,
						notification_type: NotificationType.MATCH,
						notification_text: `You have a new match! Start a conversation`,
						link: `/profile/${liker}`,
					};
					socket.emit('send_notification', liked, notification);
					const notification2 = {
						sender_id: liker,
						receiver_id: liker,
						notification_type: NotificationType.MATCH,
						notification_text: `You have a new match! Start a conversation`,
						link: `/profile/${liked}`,
					};
					socket.emit('send_notification', liker, notification2);
				}
			}
		} catch (err) {}
	};
	const handleClick = () => {
		setLiked(true);
		likeProfile();
	};

	return (
		<button className="button is-primary is-medium" onClick={handleClick}>
			<span className="icon is-medium">
				<FcLike />
			</span>
			<span>Like</span>
		</button>
	);
};

export const UnlikeButton = ({
	otherUserProfile,
	setLiked,
	setMatch,
}: UnlikeButtonProps) => {
	const { userData } = useUserContext();

	const unlikeProfile = async () => {
		const liked = otherUserProfile.user_id;
		const liker: number = userData.user_id;
		try {
			const response = await authAPI.delete(`/like?liker=${liker}&liked=${liked}`, {});

			// Emit notification
			const notification = {
				sender_id: liker,
				receiver_id: liked,
				notification_type: NotificationType.UNLIKE,
				notification_text: `Somebody unliked you!`,
				link: `/profile/${liker}`,
			};
			if (response.status === 200) {
				if (socket.disconnected)
					socket.open()
				socket.emit('send_notification', liked, notification);
			}
		} catch (err) {}
	};

	const handleClick = () => {
		setLiked(false);
		setMatch(false);
		unlikeProfile();
	};
	return (
		<button
			className="button is-medium is-primary is-outlined"
			onClick={handleClick}
		>
			<span className="icon is-medium">
				<FcDislike />
			</span>
			<span>Unlike</span>
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

export const NewProfileButton = ({ setEditMode }: EditButtonProps) => {
	return (
		<div className="my-6 pt-6 mx-3">
			<div className="card p-3 rounded-corners has-text-centered">
				<section className="section">
					<h3 className="title is-3">
						Before we start, let&apos;s create a profile for you!
					</h3>
					<button
						className="button is-primary mt-3"
						onClick={() => setEditMode(true)}
					>
						Create new profile
					</button>
				</section>
			</div>
		</div>
	);
};

export const SubmitAndResetButtons = ({
	resetSearch,
	handleSubmit,
}: ButtonsProps) => {
	return (
		<div className="column is-one-third">
			<div className="label is-invisible">Submit</div>
			<div className="buttons">
				<button
					type="submit"
					onClick={handleSubmit}
					className="button is-primary"
				>
					Search
				</button>
				<button type="reset" onClick={resetSearch} className="button is-primary is-outlined">
					Reset to default
				</button>
			</div>
		</div>
	);
};

// Submit button with disabled and loading
export const SubmitButton = ({ validForm, loadingState }: IButton) => {
	if (!validForm)
		return (
			<button type="submit" className="button is-primary" disabled>
				Submit
			</button>
		);
	if (validForm && !loadingState)
		return (
			<button type="submit" className="button is-primary">
				Submit
			</button>
		);
	if (validForm && loadingState)
		return (
			<button type="submit" className="button is-primary is-loading">
				Submit
			</button>
		);
	return (
		<button type="submit" className="button is-primary is-loading" disabled>
			Submit
		</button>
	);
};
