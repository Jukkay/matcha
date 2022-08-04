import { useState } from 'react';
import { IFormInputField, IHelper, IState, IButton } from '../types/types';

export const Label = ({ label, name }: IFormInputField) => {
	if (!label) return null;
	return (
		<label htmlFor={name} className="label">
			{label}
		</label>
	);
};

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

export const LeftIcon = ({ leftIcon }: IFormInputField) => {
	if (!leftIcon) return null;
	return <span className="icon is-small is-left">{leftIcon}</span>;
};

export const RightIcon = ({ rightIcon, validator }: IFormInputField) => {
	if (!rightIcon) return null;
	return validator ? (
		<span className="icon is-small is-right">{rightIcon}</span>
	) : (
		<span className="icon is-small is-right is-hidden">{rightIcon}</span>
	);
};

export const ErrorMessage = ({ errorMessage, error }: IFormInputField) => {
	if (!errorMessage) return null;
	return error ? (
		<p className="help is-danger">{errorMessage}</p>
	) : (
		<p className="help is-danger is-sr-only">{errorMessage}</p>
	);
};

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

