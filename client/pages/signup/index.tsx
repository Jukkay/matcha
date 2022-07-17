import type { NextPage } from "next";
import { useRef, useState, useEffect, ChangeEventHandler, ReactNode } from "react";
import { IconType } from "react-icons";
import { FaCheck, FaUser, FaLock, FaEnvelope, } from "react-icons/fa";
import { CLIENT_RENEG_LIMIT } from "tls";

type SignupProps = {
  // prop types here
};

interface IFormInputField {
  label?: string
  helper?: string
  errorMessage?: string
  type?: string
  name?: string
  placeholder?: string
  value?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onChange?: ChangeEventHandler
  required?: boolean
  pattern?: string
  error?: boolean
}

const Label = ({ label }: IFormInputField) => {
  if (!label)
    return null
  return (
    <label className="label">{label}</label>
  )
}

const Helper = ({ helper }: IFormInputField) => {
  if (!helper)
    return null
  return (
    <p className="help">{helper}</p>
  )
}

const LeftIcon = ({ leftIcon }: IFormInputField) => {
  if (!leftIcon)
    return null
  return (
    <span className="icon is-small is-left">
      {leftIcon}
    </span>
  )
}
const RightIcon = ({ rightIcon }: IFormInputField) => {
  if (!rightIcon)
    return null
  return (
    <span className="icon is-small is-right">
      {rightIcon}
    </span>
  )
}

const ErrorMessage = ({ errorMessage, error }: IFormInputField) => {
  if (!errorMessage)
    return null
  return error ? <p className="help is-danger">{errorMessage}</p> : <p className="help is-danger is-hidden">{errorMessage}</p>
}

const FormInput = ({ label, helper, errorMessage, name, onChange, leftIcon, rightIcon, error, ...inputAttributes }: IFormInputField) => {

  const [hasFocus, setFocus] = useState(false);

  // Focus on field
  const onFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFocus(true)
  }

  const [errorHidden, setErrorHidden] = useState(false);

  // Blur field
  const onBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFocus(false)
  }

  return (
    <div className="field">
      <Label label={label} />
      <Helper helper={helper} />
      <div className="control has-icons-left has-icons-right">
        <input className="input" name={name} {...inputAttributes} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
        <LeftIcon leftIcon={leftIcon} />
        <RightIcon rightIcon={rightIcon} />
      </div>
      <ErrorMessage errorMessage={errorMessage} error={error} />
    </div>
  )
}
const Signup: NextPage = (props: SignupProps) => {
  const [validUsername, setValidUsername] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [validMatch, setValidMatch] = useState(false);
  const [hasFocusPassword, setFocusPassword] = useState(false);
  const [hasFocusMatch, setFocusMatch] = useState(false);
  const [hasFocusName, setFocusName] = useState(false);
  const [hasFocusUsername, setFocusUsername] = useState(false);
  const [validForm, setValidForm] = useState(false)

  const [values, setValues] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: ''
  })

  const [errors, setErrors] = useState({
    username: false,
    password: false,
    confirmPassword: false,
    email: false,
    name: false
  })

  const inputs = [
    {
      id: 1,
      type: 'text',
      placeholder: 'Username',
      name: 'username',
      label: 'Username *',
      helper: 'Username helper',
      errorMessage: 'Error message',
      leftIcon: <FaUser />,
      rightIcon: <FaCheck color="green" />,
      required: true
    },
    {
      id: 2,
      type: 'password',
      placeholder: 'Password',
      name: 'password',
      label: 'Password *',
      helper: 'Helper',
      errorMessage: 'Error message',
      leftIcon: <FaLock />,
      rightIcon: <FaCheck color="green" />,
      required: true
    },
    {
      id: 3,
      type: 'password',
      placeholder: 'Confirm password',
      name: 'confirmPassword',
      label: 'Confirm password *',
      helper: 'Helper',
      errorMessage: 'Error message',
      leftIcon: <FaLock />,
      rightIcon: <FaCheck color="green" />,
      required: true
    },
    {
      id: 4,
      type: 'email',
      placeholder: 'Email',
      name: 'email',
      label: 'Email *',
      helper: 'Helper',
      errorMessage: 'Error message',
      leftIcon: <FaEnvelope />,
      rightIcon: <FaCheck color="green" />,
      required: true
    },
    {
      id: 5,
      type: 'text',
      placeholder: 'Name',
      name: 'name',
      label: 'Name',
      helper: 'Helper',
      errorMessage: 'Error message',
      leftIcon: <FaUser />,
      rightIcon: <FaCheck color="green" />,
      required: false
    },
  ]

  // Update object values
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  // Username validation
  useEffect(() => {
    setErrors({ ...errors, username: /^[a-zA-Z0-9.]{3,32}$/.test(values.username) });
  }, [values.username]);

  // Password validation
  useEffect(() => {
    const result = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(values.password);
    setErrors({ ...errors, password: !result })
    console.log(errors)
    const match = values.password === values.confirmPassword && values.confirmPassword.length > 7;
    setErrors({ ...errors, confirmPassword: !match })
  }, [values.password, values.confirmPassword]);

  // Form validation
  useEffect(() => {
    if (!(validUsername && validPassword && validMatch))
      return
    setValidForm(true)
  }, [])

  // Handle submit
  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
  }

  return (

    <div className="columns">
      <div className="column is-half is-offset-one-quarter">
        <section className="section">
          <div className="box">
            <form onSubmit={handleSubmit}>
              <h3 className="title is-3">Create new account</h3>
              {inputs.map(input => (
                <FormInput key={input.id} {...input} error={errors[input.name as keyof typeof errors]} leftIcon={input.leftIcon} rightIcon={input.rightIcon} value={values[input.name as keyof typeof values]} onChange={onChange} />

              ))}
              <input type="submit" className="button is-primary" />
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
