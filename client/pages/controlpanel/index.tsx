import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import {
	FaCheck,
	FaUser,
	FaLock,
	FaEnvelope,
	FaBirthdayCake,
} from 'react-icons/fa';
import { FormInput, Notification, SubmitButton } from '../../components/form';
import { useNotificationContext } from '../../components/NotificationContext';
import { useUserContext } from '../../components/UserContext';
import { ActivePage, EditProps, IProfile, ViewProps } from '../../types/types';
import { authAPI } from '../../utilities/api';

const NotLoggedIn = () => {
	return (
		<div>
			<section className="section">
				<p>Please log in first.</p>
			</section>
		</div>
	);
};

const LoggedIn = () => {
	// Context states
	const { userData, updateUserData, profile, setProfile } = useUserContext();
	const { setActivePage } = useNotificationContext();

	// validator states
	const [validUsername, setValidUsername] = useState(false);
	const [validPassword, setValidPassword] = useState(false);
	const [validMatch, setValidMatch] = useState(false);
	const [validEmail, setValidEmail] = useState(false);
	const [validName, setValidName] = useState(false);
	const [validBirthday, setValidBirthday] = useState(false);
	const [validForm, setValidForm] = useState(false);

	// Form states
	const [success, setSuccess] = useState(false);
	const [showGenericError, setShowGenericError] = useState(false);
	const [loading, setLoading] = useState(false);

	// input values
	const [values, setValues] = useState({
		birthday: '',
		username: '',
		password: '',
		confirmPassword: '',
		email: '',
		name: '',
	});

	// error states
	const [errors, setErrors] = useState({
		birthday: false,
		username: false,
		password: false,
		confirmPassword: false,
		email: false,
		name: false,
	});

	// Error messages
	const [errorMessages, setErrorMessages] = useState({
		birthday: 'You seem to be younger than 18',
		username: 'Invalid username',
		password: 'Invalid password',
		confirmPassword: 'Passwords do not match',
		email: 'Invalid email address',
		name: 'Invalid name',
	});

	// Data for input fields
	const inputs = [
		{
			id: 1,
			type: 'date',
			name: 'birthday',
			label: 'Date of birth *',
			autoComplete: 'bday',
			helper: 'You must be at least 18 years old to register',
			leftIcon: <FaBirthdayCake />,
			rightIcon: <FaCheck color="green" />,
			validator: validBirthday,
            value: values.birthday,
			required: true,
		},
		{
			id: 2,
			type: 'text',
			placeholder: 'Username',
			name: 'username',
			label: 'Username *',
			autoComplete: 'username',
			helper: 'Username must be between 3 and 32 characters and may not contain special characters',
			leftIcon: <FaUser />,
			rightIcon: <FaCheck color="green" />,
			validator: validUsername,
            value: values.username,
			required: true,
		},
		{
			id: 3,
			type: 'password',
			placeholder: 'Password',
			name: 'password',
			label: 'Password *',
			autoComplete: 'new-password',
			helper: 'Password must be between 8 and 255 characters long and include lower (a-z) and upper (A-Z) case letters and at least one digit (0-9).',
			leftIcon: <FaLock />,
			rightIcon: <FaCheck color="green" />,
			validator: validPassword,
			required: true,
		},
		{
			id: 4,
			type: 'password',
			placeholder: 'Confirm password',
			name: 'confirmPassword',
			label: 'Confirm password *',
			autoComplete: 'new-password',
			leftIcon: <FaLock />,
			rightIcon: <FaCheck color="green" />,
			validator: validMatch,
			required: true,
		},
		{
			id: 5,
			type: 'email',
			placeholder: 'Email',
			name: 'email',
			label: 'Email *',
			autoComplete: 'email',
			leftIcon: <FaEnvelope />,
			rightIcon: <FaCheck color="green" />,
            value: values.email,
			validator: validEmail,
			required: true,
		},
		{
			id: 6,
			type: 'text',
			placeholder: 'Name',
			name: 'name',
			label: 'Name',
			autoComplete: 'name',
			helper: 'This is the name visible for other users. The name must be between 3 and 32 characters and only letters and numbers and spaces are allowed.',
			leftIcon: <FaUser />,
			rightIcon: <FaCheck color="green" />,
            value: values.name,
			validator: validName,
			required: false,
		},
	];

	// Get user data

	useEffect(() => {
		const getUserData = async () => {
			try {
				let response = await authAPI.get(`/user/${userData.user_id}`);
				if (response?.data?.userData) {
					setValues({
						...values,
						birthday: new Date(response.data.userData.birthday).toISOString().substring(0,10),
						username: response.data.userData.username,
						email: response.data.userData.email,
						name: response.data.userData.name,
					});
				}
			} catch (err) {
				console.error(err);
			}
		};
		getUserData();
		setActivePage(ActivePage.CONTROL_PANEL);
	}, []);

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [event.target.name]: event.target.value });
	};

	// Birthday validation
	useEffect(() => {
		if (!values.birthday) return;
		const birthday = new Date(values.birthday).getTime();
		const now = new Date().getTime();
		const age = (now - birthday) / (1000 * 60 * 60 * 24) / 365;
		if (age >= 18) {
			setValidBirthday(true);
			setErrors({
				...errors,
				birthday: false,
			});
		} else {
			setValidBirthday(false);
			setErrors({
				...errors,
				birthday: true,
			});
		}
	}, [values.birthday]);

	// Username validation
	useEffect(() => {
		if (values.username.length < 3) return;
		const result = /^[a-zA-Z0-9.]{3,32}$/.test(values.username);
		setErrors({
			...errors,
			username: !result,
		});
		setErrorMessages({ ...errorMessages, username: 'Invalid username' });
		setValidUsername(result);
	}, [values.username]);

	// Password validation
	useEffect(() => {
		if (values.password.length < 3) return;
		const result = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]){8,255}/.test(
			values.password
		);
		setErrors({ ...errors, password: !result });
		setErrorMessages({ ...errorMessages, password: 'Invalid password' });
		setValidPassword(result);

		if (values.confirmPassword.length < 3) return;
		const match = values.password === values.confirmPassword;
		setErrors({ ...errors, confirmPassword: !match });
		setErrorMessages({
			...errorMessages,
			confirmPassword: 'Passwords do not match',
		});
		setValidMatch(match);
	}, [values.password, values.confirmPassword]);

	// Email validation
	useEffect(() => {
		if (values.email.length < 3) return;
		const result = /^\S+@\S+\.\S+$/i.test(values.email);
		setErrors({
			...errors,
			email: !result,
		});
		setErrorMessages({
			...errorMessages,
			email: 'Invalid email address',
		});
		setValidEmail(result);
	}, [values.email]);

	// Name validation
	useEffect(() => {
		if (values.name.length < 3) return;
		const result = /^[a-zA-Z0-9. ]{3,32}$/.test(values.name);
		setErrors({
			...errors,
			name: !result,
		});
		setErrorMessages({ ...errorMessages, name: 'Invalid name' });
		setValidName(result);
	}, [values.name]);

    // Form validation
    useEffect(() => {
        if (validBirthday && validUsername && validPassword && validEmail && validMatch) {
        if (values.name && !validName) setValidForm(false);
        else setValidForm(true);
        } else setValidForm(false);
    }, [validBirthday, validUsername, validPassword, validEmail, validMatch]);

	// Handle submit
	const handleSubmit = async (event: React.SyntheticEvent) => {
		event.preventDefault();
		setLoading(true);
		setShowGenericError(false);
		try {
			const response = await authAPI.patch('/user/', values);
			if (response.status === 200) setSuccess(true);
		} catch (err: any) {
			const errorMessage = err.response?.data?.message;
			const errorField = err.response?.data?.field;
			if (errorMessage && errorField) {
				setErrorMessages({
					...errorMessages,
					[errorField]: errorMessage,
				});
				setErrors({ ...errors, [errorField]: true });
			}
			if (errorMessage && !errorField) {
				setShowGenericError(true);
			}
		} finally {
			setLoading(false);
		}
	};

	// Component
	return success ? (
		<section className="section">
			<div className="box has-text-centered">
				<section className="section">
					<h3 className="title is-3">Changes saved successfully</h3>
				</section>
			</div>
		</section>
	) : (
		<section className="section">
			<div className="box">
				<section className="section">
					<form onSubmit={handleSubmit} autoComplete="on">
						<h3 className="title is-3">
							Update account information
						</h3>

						{inputs.map((input) => (
							<FormInput
								key={input.id}
								{...input}
								errorMessage={
									errorMessages[
										input.name as keyof typeof errorMessages
									]
								}
								error={
									errors[input.name as keyof typeof errors]
								}
								validator={input.validator}
								leftIcon={input.leftIcon}
								rightIcon={input.rightIcon}
								value={input.value}
								onChange={onChange}
							/>
						))}

						<div className="field mt-5">
							<SubmitButton
								validForm={validForm}
								loadingState={loading}
							/>
						</div>
					</form>
					<Notification
						notificationText="Server error. Please try again later."
						notificationState={showGenericError}
						handleClick={() => setShowGenericError(false)}
					/>
				</section>
			</div>
		</section>
	);
};

const ControlPanel: NextPage = () => {
	const { accessToken } = useUserContext();
	return (
		<div className="columns is-centered">
			<div className="column is-half">
				{accessToken ? <LoggedIn /> : <NotLoggedIn />}
			</div>
		</div>
	);
};

export default ControlPanel;
