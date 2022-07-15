import type { NextPage } from "next";
import { useRef, useState, useEffect } from "react";
import "bulma/css/bulma.min.css";
import { Card, Columns, Heading, Form, Button } from "react-bulma-components";
import { FaCheck } from "react-icons/fa";

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
  const [name, setName] = useState("");
  const [hasFocusPassword, setFocusPassword] = useState(false);
  const [hasFocusMatch, setFocusMatch] = useState(false);
  const [hasFocusName, setFocusName] = useState(false);
  const [hasFocusUsername, setFocusUsername] = useState(false);

  // Username validation
  useEffect(() => {
    setValidUsername(/^[a-zA-Z0-9.]{3,32}$/.test(username));
  }, [username]);

  // Password validation
  useEffect(() => {
    const result = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password);
    setValidPassword(result);
    const match = password === confirmPassword && confirmPassword.length > 7;
    setValidMatch(match);
  }, [password, confirmPassword]);

  return (
    <Columns centered={true}>
      <Columns.Column size="half">
    <Card>
      <Card.Content>
        <form>
          <Heading title="Sign Up" />
          <Form.Field>
            <Form.Label>
              Username{" "}
              <span className={validUsername ? "is-hidden" : ""}>*</span>
              <span className={validUsername ? "" : "is-hidden"}>
                <FaCheck color="green" />
              </span>
            </Form.Label>
            <Form.Control>
              <Form.Input
                color="primary"
                value={username}
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusUsername(true)}
                onBlur={() => setFocusUsername(false)}
                required
              />
            </Form.Control>
            <p className={`help ${hasFocusUsername ? "" : "is-hidden"}`}>
              Username must be 3-32 characters long and only alphabets and
              digits 0-9 are allowed.
            </p>
            <p
              className={`help is-danger ${
                username.length > 2 && !validUsername && hasFocusUsername
                  ? ""
                  : "is-hidden"
              }`}
            >
              Invalid username
            </p>
          </Form.Field>
          <Form.Field>
            <Form.Label>
              Password{" "}
              <span className={validPassword ? "is-hidden" : ""}>*</span>
              <span className={validPassword ? "" : "is-hidden"}>
                <FaCheck color="green" />
              </span>
            </Form.Label>
            <Form.Control>
              <Form.Input
                color="primary"
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusPassword(true)}
                onBlur={() => setFocusPassword(false)}
                required
              />
            </Form.Control>
            <p className={`help ${hasFocusPassword ? "" : "is-hidden"}`}>
              Password must be at least 8 characters long and include at least
              one upper (A-Z) and lower case (a-z) letter and a digit (0-9)
            </p>
            <p
              className={`help is-danger ${
                password.length > 7 && !validPassword && hasFocusPassword
                  ? ""
                  : "is-hidden"
              }`}
            >
              Invalid password
            </p>
          </Form.Field>
          <Form.Field>
            <Form.Label>
              Confirm password{" "}
              <span className={validMatch ? "is-hidden" : ""}>*</span>
              <span className={validMatch ? "" : "is-hidden"}>
                <FaCheck color="green" />
              </span>
            </Form.Label>
            <Form.Control>
              <Form.Input
                color="primary"
                type="password"
                value={confirmPassword}
                placeholder="Confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusMatch(true)}
                onBlur={() => setFocusMatch(false)}
                required
              />
            </Form.Control>
            <p
              className={`help is-danger ${
                confirmPassword.length > 7 && !validMatch && hasFocusMatch
                  ? ""
                  : "is-hidden"
              }`}
            >
              Passwords don't match
            </p>
          </Form.Field>
          <Form.Field>
            <Form.Label>Name</Form.Label>
            <Form.Control>
              <Form.Input
                color="primary"
                value={name}
                placeholder="Username"
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusName(true)}
                onBlur={() => setFocusName(false)}
              />
            </Form.Control>
            <p className={`help ${hasFocusName ? "" : "is-hidden"}`}>
              This is the name shown to other users. If no name is given, your
              username will be used instead.
            </p>
          </Form.Field>
          <Form.Field>
            <Form.Control>
              <Button className="btn btn-primary">Submit</Button>
              <p>Fields marked with asterisk (*) are mandatory.</p>
            </Form.Control>
          </Form.Field>
        </form>
      </Card.Content>
    </Card>
    </Columns.Column>
    </Columns>
  );
};

export default Signup;
