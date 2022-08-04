import {
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
} from "react";

export type SignupProps = {
  // prop types here
};

export interface EditProps {
  editMode?: boolean;
  setEditMode: (boolean: boolean) => void;
  profile?: IProfile;
}
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
  handleClick?: MouseEventHandler<HTMLDivElement>;
}

export interface IHelper {
  helper?: string;
  focus: boolean;
}

export interface IButton {
  validForm?: boolean;
  loadingState?: boolean;
}

export interface IProfile {
  gender: string;
  looking: string;
  introduction: string;
  country: string;
  city: string
}

export interface ITag {
  text: string;
  key: string;
  interests: string[];
  setInterests: SetStateAction<any>;
  setTagError: SetStateAction<any>;
}

export interface ISearchResult {
	result: string[];
	interests: string[];
	setInterests: SetStateAction<any>;
	setResult: SetStateAction<any>;
	setTagError: SetStateAction<any>;
	query: string;
  }
export interface ISelector {
  profile: IProfile;
  setProfile: SetStateAction<any>,
}