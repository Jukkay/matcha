import {
	ChangeEventHandler,
	MouseEventHandler,
	ReactNode,
	SetStateAction,
} from 'react';

export interface EditProps {
	setEditMode: (boolean: boolean) => void;
	profile: IProfile;
	setProfile: SetStateAction<any>;
}

export interface ViewProps {
	setEditMode: (boolean: boolean) => void;
	profile: IProfile;
}

export interface FileInputProps {
	files: FileList | undefined;
	setFiles?: SetStateAction<any>;
	setFileAmountError?: SetStateAction<any>;
	setFileError?: SetStateAction<any>;
	imageAmount?: number;
	setNewProfileImage: SetStateAction<any>;
}

export interface ProfileViewProps {
	setEditMode: (boolean: boolean) => void;
	profile: IProfile;
}

export interface OtherUserViewProps {
	otherUserProfile: IOtherUserProfile;
}
export interface UnlikeButtonProps {
	otherUserProfile: IOtherUserProfile;
	setLiked: SetStateAction<any>;
	setMatch: SetStateAction<any>;
}
export interface LikeButtonProps {
	profile: IOtherUserProfile;
	setLiked: SetStateAction<any>;
	setMatch: SetStateAction<any>;
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
	name: string;
	birthday: string;
	profile_image: string;
	gender: string;
	looking: string;
	min_age: number;
	max_age: number;
	introduction: string;
	interests: string[];
	country: string;
	city: string;
	latitude?: string;
	longitude?: string;
	user_latitude?: string;
	user_longitude?: string;
	famerating: number;
}

export interface IOtherUserProfile {
	user_id: number;
	name: string;
	birthday: string;
	profile_image: string;
	gender: string;
	looking: string;
	min_age: number;
	max_age: number;
	introduction: string;
	interests: string[];
	country: string;
	city: string;
	latitude: string;
	longitude: string;
	user_latitude?: string;
	user_longitude?: string;
	distance?: number;
	famerating: number;
	liked: number;
	likes_requester: number;
	match_id: number;
	last_login: string;
}

export interface IResultsProfile {
	user_id: number;
	name: string;
	birthday: string;
	profile_image: string;
	gender: string;
	looking: string;
	min_age: number;
	max_age: number;
	introduction: string;
	interests: string;
	country: string;
	city: string;
	latitude: string;
	longitude: string;
	user_latitude?: string;
	user_longitude?: string;
	famerating: number;
	distance: number;
	common_tags: number;
	online: boolean;
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

export interface ISelectorProfile {
	profile: IProfile;
	setProfile: SetStateAction<any>;
	isRequired: boolean;
}
export interface IAgeRange {
	profile: IProfile;
	setProfile: SetStateAction<any>;
}

export interface ITextArea {
	label?: string;
	id?: string;
	value?: string;
	placeholder?: string;
	onChange?: (e: any) => void;
	size?: number;
}

export interface IThumbnails {
	preview: string[];
	setPreview: SetStateAction<any>;
	setFiles?: SetStateAction<any>;
	setNewProfileImage: SetStateAction<any>;
}

export interface GalleryProps {
	files: FileList | undefined;
	setImageError: SetStateAction<any>;
	setImageAmount: SetStateAction<any>;
}

export interface SearchProps {
	searchParams: ISearchParams;
	setSearchParams: SetStateAction<any>;
	setResults: SetStateAction<any>;
	results: IResultsProfile[];
	filteredResults: IResultsProfile[];
	setFilteredResults: SetStateAction<any>;
	setLoadStatus: SetStateAction<any>;
	sort: SortType;
	setSort: SetStateAction<any>;
}

export interface AdvancedSearchProps {
	searchParams: ISearchParams;
	setSearchParams: SetStateAction<any>;
	interests: string[];
	setInterests: SetStateAction<any>;
	results: IResultsProfile[];
	setFilteredResults: SetStateAction<any>;
	sort: SortType;
	setSort: SetStateAction<any>;
}
export interface ResultsProps {
	sortedResults: IResultsProfile[];
	loadStatus: LoadStatus;
}

export interface ISearchParams {
	gender: string;
	looking: string;
	country: string;
	city: string;
	min_age: number;
	max_age: number;
	min_famerating: string;
	max_famerating: string;
	max_distance: string;
}

export interface SearchParamsProps {
	searchParams: ISearchParams;
	setSearchParams: SetStateAction<any>;
}

export interface BasicSearchProps {
	searchParams: ISearchParams;
	setSearchParams: SetStateAction<any>;
	resetSearch: (event: React.FormEvent) => void;
	handleSubmit: (event: React.FormEvent) => void;
}

export interface ButtonsProps {
	resetSearch: (event: React.FormEvent) => void;
	handleSubmit: (event: React.FormEvent) => void;
}

export interface LogEntry {
	username: string;
	visit_date: string;
}

export interface IProfileCard {
	user_id: number;
	name: string;
	birthday: string;
	city: string;
	country: string;
	profile_image: string;
	famerating: number;
	distance: number;
	interests: string;
	ref?: any;
}

export interface IMatch {
	match_id: number;
	name: string;
	profile_image: string;
	match_date: string;
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

export interface SortProps {
	sort: SortType;
	setSort: SetStateAction<any>;
}

export interface INotification {
	notification_id: number;
	receiver_id: number;
	notification_text: string;
	notification_type: string;
	sender_id: number;
	notification_time: string;
	notification_read: boolean;
	link: string;
}

export enum ActivePage {
	MESSAGES = 'Messages',
	SEARCH = 'Search',
	MAIN = 'Main',
	PROFILE = 'Profile',
	OTHER_PROFILE = 'Other profile',
	HISTORY = 'History',
	CONTROL_PANEL = 'Control panel',
	LIKES = 'Likes',
	NONE = 'None',
}

export enum NotificationType {
	MESSAGE = 'Message',
	VIEW = 'View',
	LIKE = 'Like',
	MATCH = 'Match',
	UNLIKE = 'Unlike',
	UNMATCH = 'Unmatch',
}

export interface ILikeProfile extends IProfileCard {
	like_date: string;
	target_id: number;
}

export interface OnlineStatusProps {
	user_id: number;
}

export interface TextInput {
	text: string;
}

export interface ResultProfiles {
	profiles: IResultsProfile[];
}

export interface LikeProp {
	likeCount: number;
}

export interface IAgeRangeSlider {
	state: ISearchParams | IProfile;
	setState: SetStateAction<any>;
}

export interface IFameratingRangeSlider {
	state: ISearchParams
	setState: SetStateAction<any>;
}


export interface INavbarProfile {
	username: string;
	profile_image: string;
}