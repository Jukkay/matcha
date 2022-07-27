import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { LoginProps } from "./types";
import { FormInput, SubmitButton, Notification } from "./components";
import { useUserContext } from "../../components/UserContext";
import {api} from "../../utilities/api";
import Link from "next/link";

const Login: NextPage = (props: LoginProps) => {
  // Form states
  const [success, setSuccess] = useState(false);
  const [validForm, setValidForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  // Get user data from context
  const {
    updateUserData,
    userData,
    accessToken,
    refreshToken,
    updateAccessToken,
    updateRefreshToken,
  } = useUserContext();

  // Form values
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  // Error states
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    generic: false,
    server: false,
  });

  // Error messages
  const [errorMessages, setErrorMessages] = useState({
    username: "Invalid username",
    password: "Invalid password",
    generic: "",
    server: "Server error. Please try again later.",
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
      required: true,
    },
    {
      id: 2,
      type: "password",
      placeholder: "Password",
      name: "password",
      label: "Password *",
      autoComplete: "current-password",
      leftIcon: <FaLock />,
      required: true,
    },
  ];

  // Update object values
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // Check username and password are not empty

  useEffect(() => {
    if (values.username.length > 2 && values.password.length > 7) {
      setValidForm(true);
    } else setValidForm(false);
  }, [values.username, values.password]);

  // Handle submit
  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors({
      username: false,
      password: false,
      generic: false,
      server: false,
    });

    try {
      const response = await api.post(`login/`, values);
      if (response.status === 200) {
        if (response?.data?.auth !== true) {
          throw new Error("Invalid server response");
        }
        setSuccess(true);
        if (response.data.user) {
          updateUserData(response.data.user);
          sessionStorage.setItem(
            "userData",
            JSON.stringify(response.data.user)
          );
        }
        console.log(userData);
        if (response.data.accessToken && response.data.refreshToken) {
          updateAccessToken(response.data.accessToken);
          updateRefreshToken(response.data.refreshToken);
          sessionStorage.setItem("accessToken", response.data.accessToken);
          sessionStorage.setItem("refreshToken", response.data.refreshToken);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message;
      const errorField = err.response?.data?.field;
      if (errorField) {
        setErrors({ ...errors, [errorField]: true });
        if (errorField === "generic") {
          setNotification(true);
          setNotificationText(errorMessage);
        }
      } else {
        setNotification(true);
        setNotificationText(errorMessages.server);
      }
    } finally {
      setLoading(false);
    }
  };

  return success ? (
    <div className="columns">
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box has-text-centered">
            <section className="section">
              <h3 className="title is-3">Login successful</h3>
              <div>{userData.token}</div>
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
                <h3 className="title is-3">Log in</h3>
                {inputs.map((input) => (
                  <FormInput
                    key={input.id}
                    {...input}
                    errorMessage={
                      errorMessages[input.name as keyof typeof errorMessages]
                    }
                    error={errors[input.name as keyof typeof errors]}
                    leftIcon={input.leftIcon}
                    value={values[input.name as keyof typeof values]}
                    onChange={onChange}
                  />
                ))}
                <div className="field mt-5">
                  <SubmitButton validForm={validForm} loadingState={loading} />
                </div>
              </form>
              <Notification
                notificationText={notificationText}
                notificationState={notification}
                handleClick={() => setNotification(false)}
              />
              <Link href="/passwordreset">
                Forgot your password? Click here to reset your password.
              </Link>
              <br />
              <Link href="/emailconfirmation">
                Click here to re-send confirmation email.
              </Link>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
