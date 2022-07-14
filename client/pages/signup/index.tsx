import type { NextPage } from "next";
import { useRef, useState, useEffect } from "react";
import { TextInput } from "./textInput"

type SignupProps = {
  // prop types here
};

const Signup: NextPage = (props: SignupProps) => {
  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validMatch, setValidMatch] = useState(false);

  // Password validation

  useEffect(() => {
    setValidPassword(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/i.test(password));
    setValidMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  return (
    <div className="md:container md:mx-auto space-y-5">
      <article className="prose mb-10">
        <h1>Sign up</h1>
      </article>
      <form>
        <TextInput
          type="text"
          label="Username *"
          name="username"
          placeholder="Username"
          helper=""
          error="error text"
          visibilityState={validUsername}
          required
        />
        <TextInput
          type="password"
          label="Password *"
          name="password"
          placeholder="Password"
          helper="Password must be at least 8 characters long and include at least one upper (A-Z) and lower case (a-z) letter and a digit (0-9)."
          error="Invalid password"
          visibilityState={validPassword}
          required
        />
        <TextInput
          type="password"
          label="Confirm password *"
          name="confirmPassword"
          placeholder="Confirm password"
          error="Passwords don't match."
          required
        />
        <TextInput
          type="text"
          label="Name"
          name="name"
          placeholder="Name"
          helper="This is the name shown to other users. If no name is given, your username will be used instead."
          error="error text"
        />
        <button className="btn btn-primary">Submit</button>
      </form>
      <p>Fields marked with asterisk (*) are mandatory.</p>
    </div>
  );
};

export default Signup;
