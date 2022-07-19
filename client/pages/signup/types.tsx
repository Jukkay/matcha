
import { ChangeEventHandler, MouseEventHandler, ReactNode } from "react";

export type SignupProps = {
	// prop types here
  };

export interface IFormInputField {
	label?: string;
	helper?: string;
	errorMessage?: string;
	type?: string;
	name?: string;
	placeholder?: string;
	value?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	onChange?: ChangeEventHandler;
	required?: boolean;
	pattern?: string;
	error?: boolean;
	validator?: boolean;
  }

  export interface IState {
	validForm?: boolean;
	focus?: boolean;
	notificationText?: string;
	notificationState?: boolean;
	handleClick?: MouseEventHandler<HTMLDivElement>
  }

  export interface IHelper {
	helper?: string;
	focus: boolean;
  }

  export interface IButton {
	validForm?: boolean;
	loadingState?: boolean;
  }