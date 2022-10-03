import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { API } from '../../utilities/api';
import { FaCheck, FaEnvelope } from 'react-icons/fa';
import { FormInput, SubmitButton, Notification } from '../../components/form';

const PasswordReset: NextPage = () => {
	// validator states

	const [validEmail, setValidEmail] = useState(false);
	const [validForm, setValidForm] = useState(false);

	// Form states
	const [success, setSuccess] = useState(false);
	const [showGenericError, setShowGenericError] = useState(false);
	const [loading, setLoading] = useState(false);

	// input values
	const [values, setValues] = useState({
		email: '',
	});

	// error states
	const [errors, setErrors] = useState({
		email: false,
	});

	// Error messages
	const [errorMessages, setErrorMessages] = useState({
		email: 'Invalid email address',
	});

	// Data for input fields
	const inputs = [
		{
			id: 1,
			type: 'email',
			placeholder: 'Email',
			name: 'email',
			label: 'Email *',
			autoComplete: 'email',
			leftIcon: <FaEnvelope />,
			rightIcon: <FaCheck color="green" />,
			validator: validEmail,
			required: true,
		},
	];

	// Update object values
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [event.target.name]: event.target.value });
	};

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

	// Form validation
	useEffect(() => {
		if (validEmail) {
			setValidForm(true);
		}
	});

	// Handle submit
	const handleSubmit = async (event: React.SyntheticEvent) => {
		event.preventDefault();
		setLoading(true);
		setShowGenericError(false);
		try {
			const response = await API.post('/resetpasswordtoken/', values);
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
		<div className="columns">
			<div className="column is-half is-offset-one-quarter is-gapless">
				<section className="section">
					<div className="box has-text-centered">
						<section className="section">
							<h3 className="title is-3">
								Password reset email has been sent
							</h3>
							<p>Check your email to reset your password.</p>
						</section>
					</div>
				</section>
			</div>
		</div>
	) : (
		<div className="columns">
			<div className="column is-half is-offset-one-quarter is-gapless">
				<section className="section">
					<div className="box">
						<section className="section">
							<form onSubmit={handleSubmit} autoComplete="on">
								<h3 className="title is-3">Reset password</h3>
								<p className="mb-4">
									Password reset instructions will be sent to
									your email.
								</p>
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
											errors[
												input.name as keyof typeof errors
											]
										}
										validator={input.validator}
										leftIcon={input.leftIcon}
										rightIcon={input.rightIcon}
										value={
											values[
												input.name as keyof typeof values
											]
										}
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
			</div>
		</div>
	);
};
export default PasswordReset;
