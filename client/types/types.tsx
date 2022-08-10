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
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
  setProfile: SetStateAction<any>;
  profileExists: boolean;
  setProfileExists: SetStateAction<any>;
}

export interface ViewProps {
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
  profileExists: boolean;
}
export interface FileInputProps {
  profileExists: boolean;
}

export interface ProfileViewProps {
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
}

export interface SaveButtonProps {
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
  interests: string[];
}
export interface EditButtonProps {
  setEditMode: (boolean: boolean) => void;
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
  user_id: number;
  gender: string;
  looking: string;
  min_age: number,
  max_age: number,
  introduction: string;
  interests: {};
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
  label?: string, 
  id?: string, 
  value?: string, 
  placeholder?: string, 
  onChange?: (e: any) => void;
  options?: any[]
}

export interface ISelectorProfile {
  profile: IProfile;
  setProfile: SetStateAction<any>
}

export interface ITextArea {
  label?: string, 
  id?: string, 
  value?: string, 
  placeholder?: string, 
  onChange?: (e: any) => void;
  size?: number
}

export interface IThumbnails {
  preview: string[];
  setPreview: SetStateAction<any>
  setFiles?: SetStateAction<any>
}

export interface IUpload {
  files: FileList | undefined;
  setFiles?: SetStateAction<any>
  setPreview?: SetStateAction<any>

}