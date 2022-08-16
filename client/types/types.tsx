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

export interface UserImagesProps {
  user_id: number | undefined;
}

export interface FileInputProps {
  profileExists: boolean;
  files: FileList | undefined;
  setFiles?: SetStateAction<any>
}

export interface ProfileViewProps {
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
}

export interface OtherUserViewProps {
  profile: IProfile;
}

export interface SaveButtonProps {
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
  interests: string[];
  setProfileExists: SetStateAction<any>
  setInterestsError: SetStateAction<any>
  files: FileList | undefined;
	setFileError: SetStateAction<any>
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
  user_id: number | undefined;
  name: string | undefined;
  birthday: string | undefined;
  profile_image: string | undefined;
  gender: string | undefined;
  looking: string | undefined;
  min_age: number | undefined,
  max_age: number | undefined,
  introduction: string | undefined;
  interests: {};
  country: string | undefined;
  city: string | undefined
}

export interface ITag {
  key: string;
  text: string;
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
  profile: IProfile ;
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
export interface GalleryProps {
  files: FileList | undefined;
  setImageError: SetStateAction<any>
}

export interface SearchProps extends ResultsProps{
  searchParams: ISearchParams
  setSearchParams: SetStateAction<any>
}

export interface ResultsProps {
  results: IProfileCard[]
  setResults: SetStateAction<any>
}

export interface ISearchParams {
  gender: string,
  looking: string,
  min_age: number,
  max_age: number
}

export interface AgeRangeProps {
  searchParams: ISearchParams
  setSearchParams: SetStateAction<any>
}

export interface LogEntry {
  username: string
  visit_date: string
}

export interface IProfileCard {
  user_id?: string
  name: string
  birthday: string
  city: string
  country: string
  profile_image: string
}