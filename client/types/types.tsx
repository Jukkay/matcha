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
}

export interface ViewProps {
  setEditMode: (boolean: boolean) => void;
  profile: IProfile;
}

export interface UserImagesProps {
  user_id: number | undefined;
}

export interface FileInputProps {
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
  city: string | undefined;
  latitude?: string | undefined;
  longitude?: string | undefined;
  famerating: number | undefined;
}

export interface IResultsProfile {
  user_id: number
  name: string
  birthday: string
  profile_image: string
  gender: string
  looking: string
  min_age: number
  max_age: number
  introduction: string
  interests: string
  country: string
  city: string
  latitude: string
  longitude: string
  famerating: number
  distance: number
  common_tags: number
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

export interface SearchProps {
  searchParams: ISearchParams
  setSearchParams: SetStateAction<any>
  setResults: SetStateAction<any>
}

export interface ResultsProps {
  results: IResultsProfile[]
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
  user_id: number
  name: string
  birthday: string
  city: string
  country: string
  profile_image: string
  famerating: number
  distance: number
  interests: string
}

export interface IMatch {
  match_id: number
  name: string
  profile_image: string
  match_date: string
}

export interface ChatProps {
  matchID: number
  setMatchID: SetStateAction<any>
}
export enum SortType {
  AGE = 'Age younger first',
  REVERSE_AGE = 'Age older first',
  DISTANCE = 'Distance near to far',
  REVERSE_DISTANCE = 'Distance far to near',
  FAMERATING = 'Famerating high to low',
  REVERSE_FAMERATING = 'Famerating low to high',
  TAGS = 'More common tags first',
  REVERSE_TAGS = 'Less common tags first',
}

export enum LoadStatus {
  IDLE = 'Idle',
  LOADING = 'Loading',
  ERROR = 'Error',
  SUCCESS = 'Success',
}

export enum LocationType {
  USER = 'User',
  GEOLOCATION = 'Geolocation',
  IP = 'IP',
}


export interface SortProps {
  sort: SortType,
  setSort: SetStateAction<any>
}
