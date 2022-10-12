import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { API } from '../../utilities/api';
import { FaCheck, FaEnvelope } from 'react-icons/fa';
import { FormInput, Notification } from '../../components/form';
import { SubmitButton } from '../../components/buttons';

const PasswordReset: NextPage = () => {
	// validator states

	const [validEmail, setValidEmail] = useState(false);
	const [validForm, setValidForm] = useState(false);

	// Form states
	const [success, setSuccess] = useState(false);
	const [genericError, setGenericError] = useState(false);
	const [emailError, setEmailError] = useState(false);
	const [genericErrorMessage, setGenericErrorMessage] = useState('');
	const [emailErrorMessage, setEmailErrorMessage] = useState('');
	const [loading, setLoading] = useState(false);

	// input values
	const [values, setValues] = useState({
		email: '',
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
		setEmailError(!result);
		setValidEmail(result);
	}, [values.email]);

	// Form validation
	useEffect(() => {
		if (validEmail) {
			setValidForm(true);
		}
	}, [validEmail]);

	// Handle submit
	const handleSubmit = async (event: React.SyntheticEvent) => {
		event.preventDefault();
		setLoading(true);
		setGenericError(false);
		setEmailError(false);
		try {
			const response = await API.post('/resetpasswordtoken/', values);
			if (response.status === 200) setSuccess(true);
		} catch (err: any) {
			const errorMessage = err.response?.data?.message;
			const errorField = err.response?.data?.field;
			if (errorField == 'email' && errorMessage) {
				setEmailError(true);
				setEmailErrorMessage(errorMessage);
			}
			if (errorField == 'generic' && errorMessage) {
				setGenericError(true);
				setGenericErrorMessage(errorMessage);
			}
		} finally {
			setLoading(false);
		}
	};

	// Component
	return success ? (
		<div className="columns is-gapless is-centered">
			<div className="column is-half my-6">
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
		<div className="columns is-gapless is-centered my-6">
			<div className="column is-half">
				<section className="section">
					<div className="box">
						<section className="section">
							<form onSubmit={handleSubmit} autoComplete="on" acceptCharset="UTF-8">
								<h3 className="title is-3">Reset password</h3>
								<p className="mb-4">
									Password reset instructions will be sent to
									your email.
								</p>
								{inputs.map((input) => (
									<FormInput
										key={input.id}
										{...input}
										errorMessage={emailErrorMessage}
										error={emailError}
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
								notificationText={genericErrorMessage}
								notificationState={genericError}
								handleClick={() => setGenericError(false)}
							/>
						</section>
					</div>
				</section>
			</div>
		</div>
	);
};
export default PasswordReset;
