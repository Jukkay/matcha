import { useState } from 'react';
import {
	IFormInputField,
	IHelper,
	IState,
	IButton,
	ISelectorProfile,
	ITextArea,
	EditButtonProps,
	SearchParamsProps,
	IAgeRange,
} from '../types/types';
import { AgeRangeSlider } from './search';

// Input label text
export const Label = ({ label, name }: IFormInputField) => {
	if (!label) return null;
	return (
		<label htmlFor={name} className="label">
			{label}
		</label>
	);
};

// Input helper text
export const Helper = ({ helper, focus }: IHelper) => {
	if (!helper) return <div className="help my-6"></div>;
	return focus ? (
		<div className="help mt-3">
			<div className="help">{helper}</div>
		</div>
	) : (
		<div className="help my-6">
			<div className="help is-sr-only">{helper}</div>
		</div>
	);
};

// Left side icon in input field
export const LeftIcon = ({ leftIcon }: IFormInputField) => {
	if (!leftIcon) return null;
	return <span className="icon is-small is-left">{leftIcon}</span>;
};

// Right side icon in input field
export const RightIcon = ({ rightIcon, validator }: IFormInputField) => {
	if (!rightIcon) return null;
	return validator ? (
		<span className="icon is-small is-right">{rightIcon}</span>
	) : (
		<span className="icon is-small is-right is-hidden">{rightIcon}</span>
	);
};

// Input fiel error message
export const ErrorMessage = ({ errorMessage, error }: IFormInputField) => {
	if (!errorMessage) return null;
	return error ? (
		<p className="help is-danger">{errorMessage}</p>
	) : (
		<p className="help is-danger is-sr-only">{errorMessage}</p>
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

// Error notification
export const Notification = ({
	notificationText,
	notificationState,
	handleClick,
}: IState) => {
	return notificationState ? (
		<div className="notification is-danger my-5" onClick={handleClick}>
			<button className="delete"></button>
			{notificationText}
		</div>
	) : (
		<div
			className="notification is-danger my-5 is-sr-only"
			onClick={handleClick}
		>
			<button className="delete"></button>
			{notificationText}
		</div>
	);
};

// Generic input component
export const FormInput = ({
	label,
	helper,
	errorMessage,
	name,
	onChange,
	leftIcon,
	rightIcon,
	error,
	validator,
	...inputAttributes
}: IFormInputField) => {
	const [helpers, setHelpers] = useState({
		username: false,
		password: false,
		confirmPassword: false,
		email: false,
		name: false,
	});

	// Focus on field
	const onFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
		setHelpers({
			...helpers,
			[event.target.name]: true,
		});
	};

	// Blur field
	const onBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
		setHelpers({
			...helpers,
			[event.target.name]: false,
		});
	};
	const classnames = error ? 'input is-danger' : 'input';
	return (
		<div className="field">
			<Label label={label} name={name} />
			<div className="control has-icons-left has-icons-right">
				<input
					className={classnames}
					name={name}
					{...inputAttributes}
					onChange={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
				<LeftIcon leftIcon={leftIcon} />
				<RightIcon rightIcon={rightIcon} validator={validator} />
			</div>
			<Helper
				helper={helper}
				focus={helpers[name as keyof typeof helpers]}
			/>
			<ErrorMessage errorMessage={errorMessage} error={error} />
		</div>
	);
};

export const GPSCoordinateInput = ({ profile, setProfile }: any) => {
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProfile({ ...profile, [event.target.name]: event.target.value });
	};
	return (
		<div className="block">
			<label htmlFor="GPS" className="label my-3">
				Manually set GPS location
			</label>
			<div className="block">
				<label htmlFor="latitude" className="label my-3">
					Latitude:
				</label>
				<input
					type="text"
					className="input is-primary"
					name="user_latitude"
					value={profile.user_latitude || ''}
					onChange={onChange}
				></input>
				<label htmlFor="longitude" className="label my-3">
					Longitude:
				</label>
				<input
					type="text"
					className="input is-primary"
					name="user_longitude"
					value={profile.user_longitude || ''}
					onChange={onChange}
				></input>
			</div>
		</div>
	);
};

export const AgeRange = ({ profile, setProfile }: IAgeRange) => {
	return (
		<div className="block">
			<div className="field">
				<label htmlFor="ageRange" className="label mb-6">
					Age range *
				</label>
				<div className="control" id="ageRange">
					<AgeRangeSlider state={profile} setState={setProfile} />
				</div>
			</div>
		</div>
	);
};

export const GenderSelector = ({
	profile,
	setProfile,
	isRequired,
}: ISelectorProfile) => {
	const onChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
		setProfile({
			...profile,
			gender: event.target.value,
		});

	return (
		<div className="block">
			<label htmlFor="gender" className="label my-3">
				{isRequired ? 'Gender *' : 'Gender'}
			</label>
			<div className="select is-primary">
				<select
					id="gender"
					value={profile.gender}
					onChange={onChange}
					required={isRequired}
				>
					<option value={''} disabled>
						Choose your gender
					</option>
					<option value="Male">Male</option>
					<option value="Female">Female</option>
					<option value="Non-binary">Non-binary</option>
					<option value="Trans-man">Trans-man</option>
					<option value="Trans-woman">Trans-woman</option>
					<option value="Other">Other</option>
				</select>
			</div>
		</div>
	);
};
export const LookingSelector = ({
	profile,
	setProfile,
	isRequired,
}: ISelectorProfile) => {
	const onChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
		setProfile({
			...profile,
			looking: event.target.value,
		});

	return (
		<div className="block">
			<label htmlFor="looking" className="label my-3">
				{isRequired ? 'Gender *' : 'Gender'}
			</label>
			<div className="select is-primary">
				<select
					id="looking"
					value={profile.looking}
					onChange={onChange}
					required={isRequired}
				>
					<option value={''} disabled>
						Choose a gender
					</option>
					<option value="Male">Male</option>
					<option value="Female">Female</option>
					<option value="Non-binary">Non-binary</option>
					<option value="Trans-man">Trans-man</option>
					<option value="Trans-woman">Trans-woman</option>
					<option value="Anything goes">Anything goes</option>
				</select>
			</div>
		</div>
	);
};

// Text area component
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

export const FameratingRange = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value !== undefined)
			setSearchParams({
				...searchParams,
				min_famerating: event.target.value,
			});
	};

	const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value !== undefined)
			setSearchParams({
				...searchParams,
				max_famerating: event.target.value,
			});
	};
	return (
		<div className="block">
			<label htmlFor="min_age" className="label">
				Famerating range
			</label>

			<div className="field is-horizontal">
				<div className="field-label is-normal">
					<label htmlFor="min_famerating" className="label">
						Min
					</label>
				</div>
				<div className="field-body">
					<div className="field">
						<input
							type="number"
							id="min_famerating"
							className="input is-primary"
							min="1"
							max={searchParams.max_famerating}
							value={searchParams.min_famerating}
							onChange={handleMinChange}
						/>
					</div>
					<div className="field-label is-normal">
						<label htmlFor="max_famerating" className="label">
							Max
						</label>
					</div>
					<div className="field">
						<input
							type="number"
							id="max_famerating"
							className="input is-primary"
							min={searchParams.min_famerating}
							max="1000"
							value={searchParams.max_famerating}
							onChange={handleMaxChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export const DistanceRange = ({
	searchParams,
	setSearchParams,
}: SearchParamsProps) => {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value !== undefined)
			setSearchParams({
				...searchParams,
				max_distance: event.target.value,
		})
	};
	return (
		<div className="block">
			<label htmlFor="max_distance" className="label my-3">
				Maximum distance (km)
			</label>
			<div className="field">
				<input
					type="number"
					id="max_distance"
					min={0}
					className="input is-primary"
					value={searchParams.max_distance}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
};
