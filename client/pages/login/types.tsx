
import { ChangeEventHandler, ReactNode } from "react";

export type LoginProps = {
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
  }

  export interface IHelper {
	helper?: string;
	focus: boolean;
  }