import type { NextPage } from "next";
import { useState, useEffect} from "react";
import { FaCheck, FaUser, FaLock } from "react-icons/fa";
import { FormInput, Notification, SubmitButton } from "../../components/form";;
import { API } from "../../utilities/api";
import { useRouter } from 'next/router'

// Get token from URL

const SetPassword: NextPage = () => {

  // input values
  const [values, setValues] = useState({
    token: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // validator states
  const [validPassword, setValidPassword] = useState(false);
  const [validMatch, setValidMatch] = useState(false);
  const [validForm, setValidForm] = useState(false);

  // Form states
  const [success, setSuccess] = useState(false);
  const [showGenericError, setShowGenericError] = useState(false);
  const [loading, setLoading] = useState(false);


  // error states
  const [errors, setErrors] = useState({
    password: false,
    confirmPassword: false,
  });

  // Error messages
  const [errorMessages, setErrorMessages] = useState({
    username: "Invalid username",
    password: "Invalid password",
    confirmPassword: "Passwords do not match",
    email: "Invalid email address",
    name: "Invalid name",
  });

  // Data for input fields
  const inputs = [
    {
      id: 1,
      type: "text",
      placeholder: "Username",
      name: "username",
      label: "Username *",
      autoComplete: "username",
      leftIcon: <FaUser />,
      rightIcon: <FaCheck color="green" />,
      required: true,
    },
    {
      id: 2,
      type: "password",
      placeholder: "Password",
      name: "password",
      label: "Password *",
      autoComplete: "new-password",
      helper:
        "Password must be between 8 and 255 characters long and include lower (a-z) and upper (A-Z) case letters and at least one digit (0-9).",
      leftIcon: <FaLock />,
      rightIcon: <FaCheck color="green" />,
      validator: validPassword,
      required: true,
    },
    {
      id: 3,
      type: "password",
      placeholder: "Confirm password",
      name: "confirmPassword",
      label: "Confirm password *",
      autoComplete: "new-password",
      leftIcon: <FaLock />,
      rightIcon: <FaCheck color="green" />,
      validator: validMatch,
      required: true,
    }
  ];

  // Update object values
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // Password validation
  useEffect(() => {
    if (values.password.length < 3) return;
    const result = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]){8,255}/.test(
      values.password
    );
    setErrors({ ...errors, password: !result });
    setErrorMessages({ ...errorMessages, password: "Invalid password" });
    setValidPassword(result);

    if (values.confirmPassword.length < 3) return;
    const match = values.password === values.confirmPassword;
    setErrors({ ...errors, confirmPassword: !match });
    setErrorMessages({
      ...errorMessages,
      confirmPassword: "Passwords do not match",
    });
    setValidMatch(match);
  }, [values.password, values.confirmPassword]);

  // Form validation
  useEffect(() => {
    if (validPassword && validMatch)
      setValidForm(true);
  }, [validPassword, validMatch]);

  const router = useRouter()
  const getToken = () => {
    const { params } = router.query
    if (params) {
        return params as string
    }
    return null
  }

  // Handle submit
  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    setShowGenericError(false);
    const token = getToken();
    try {
      const response = await API.post('/setpassword/', {
        token: token,
        username: values.username,
        password: values.password
      });
      if (response.status === 201) setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      const errorField = err.response?.data?.field;
      if (errorMessage && errorField) {
        setErrorMessages({ ...errorMessages, [errorField]: errorMessage });
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
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box has-text-centered">
            <section className="section">
              <h3 className="title is-3">Password changed successfully</h3>
              <p>Please login again to continue.</p>
            </section>
          </div>
        </section>
      </div>
    </div>
  ) : (
    <div className="columns">
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box">
            <section className="section">
              <form onSubmit={handleSubmit} autoComplete="on">
                <h3 className="title is-3">Set new password</h3>

                {inputs.map((input) => (
                  <FormInput
                    key={input.id}
                    {...input}
                    errorMessage={
                      errorMessages[input.name as keyof typeof errorMessages]
                    }
                    error={errors[input.name as keyof typeof errors]}
                    validator={input.validator}
                    leftIcon={input.leftIcon}
                    rightIcon={input.rightIcon}
                    value={values[input.name as keyof typeof values]}
                    onChange={onChange}
                  />
                ))}
                <div className="field mt-5">
                  <SubmitButton validForm={validForm} loadingState={loading} />
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

export default SetPassword;
