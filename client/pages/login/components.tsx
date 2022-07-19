
import { IFormInputField, IState, IButton } from "./types";

export const Label = ({ label, name }: IFormInputField) => {
  if (!label) return null;
  return (
    <label htmlFor={name} className="label">
      {label}
    </label>
  );
};

export const LeftIcon = ({ leftIcon }: IFormInputField) => {
  if (!leftIcon) return null;
  return <span className="icon is-small is-left">{leftIcon}</span>;
};

export const ErrorMessage = ({ errorMessage, error }: IFormInputField) => {
  if (!errorMessage) return null;
  return error ? (
    <p className="help is-danger">{errorMessage}</p>
  ) : (
    <p className="help is-danger is-sr-only">{errorMessage}</p>
  );
};

export const SubmitButton = ({ validForm, loadingState }: IButton) => {
  if (!validForm) return <button type="submit" className="button is-primary" disabled>Submit</button>;
  if (validForm && !loadingState) return <button type="submit" className="button is-primary">Submit</button>;
  if (validForm && loadingState) return <button type="submit" className="button is-primary is-loading">Submit</button>;
  return <button type="submit" className="button is-primary is-loading" disabled>Submit</button>;
};

export const Notification = ({
  notificationText,
  notificationState,
  handleClick,
}: IState) => {
  return notificationState ? (
    <div className="notification is-danger my-5 is-clickable" onClick={handleClick}>
      <button className="delete"></button>
      {notificationText}
    </div>
  ) : (
    <div className="notification is-danger my-5 is-sr-only is-clickable" onClick={handleClick}>
      <button className="delete"></button>
      {notificationText}
    </div>
  );
};

export const FormInput = ({
  label,
  errorMessage,
  name,
  onChange,
  leftIcon,
  error,
  ...inputAttributes
}: IFormInputField) => {

  const classnames = error ? "input is-danger" : "input";
  return (
    <div className="field">
      <Label label={label} name={name} />
      <div className="control has-icons-left">
        <input
          className={classnames}
          name={name}
          {...inputAttributes}
          onChange={onChange}
        />
        <LeftIcon leftIcon={leftIcon} />
      </div>
      <ErrorMessage errorMessage={errorMessage} error={error} />
    </div>
  );
};
