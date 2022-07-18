import { useState } from "react";
import { IFormInputField, IHelper, IState } from "./types";

export const Label = ({ label }: IFormInputField) => {
  if (!label) return null;
  return <label className="label">{label}</label>;
};

export const Helper = ({ helper, focus }: IHelper) => {
  if (!helper) return null;
  return focus ? (
    <p className="help">{helper}</p>
  ) : (
    <p className="help is-hidden">{helper}</p>
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
    <p className="help is-danger is-hidden">{errorMessage}</p>
  );
};

export const SubmitButton = ({ validForm }: IState) => {
  if (validForm) return <input type="submit" className="button is-primary" />;
  return <input type="submit" className="button is-primary" disabled />;
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
  const classnames = error ? 'input is-danger' : 'input'
  return (
    <div className="field">
      <Label label={label} />
      <Helper helper={helper} focus={helpers[name as keyof typeof helpers]} />
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
      <ErrorMessage errorMessage={errorMessage} error={error} />
    </div>
  );
};
