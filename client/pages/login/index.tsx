import type { NextPage } from "next";
import { useState } from "react";
import { FaCheck, FaUser, FaLock } from "react-icons/fa";
import { LoginProps } from "./types";
import { FormInput, SubmitButton } from "./components";
import axios from "axios";

const Login: NextPage = (props: LoginProps) => {

  const [success, setSuccess] = useState(false);
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    username: "Invalid username",
    password: "Invalid password",
    emailValidation: "Your email address hasn't been validated yet. Check your email.",
  });

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
      autoComplete: "current-password",
      leftIcon: <FaLock />,
      rightIcon: <FaCheck color="green" />,
      required: true,
    },

  ];

  // Update object values
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // Handle submit
  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/login/", values);
      if (response.status === 201) setSuccess(true);
    } catch (err: any) {
      const errorField = err.response.data.field;
      const errorMessage = err.response.data.message;
      setErrors({ ...errors, [errorField]: true });
      setErrorMessages({ ...errorMessages, [errorField]: errorMessage });
    }
  };

  return success ? (
    <div className="columns">
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box has-text-centered">
            <section className="section">
              <h3 className="title is-3">Login successful</h3>
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
                    rightIcon={input.rightIcon}
                    value={values[input.name as keyof typeof values]}
                    onChange={onChange}
                  />
                ))}
                <div className="field mt-5">
                  <SubmitButton />
                </div>
              </form>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;