import react, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { IProfile } from '../types/types';
import { authAPI } from '../utilities/api';

export type UserInfo = {
	username: string | undefined;
	user_id: number | undefined;
	name: string | undefined;
	email: string | undefined;
	birthday: string | undefined;
	profile_image: string | undefined;
	profile_exists: boolean | undefined;
}
export interface IUser {
	user?: UserInfo;
	updateUser?: (user: UserInfo) => void;
}
export const UserContext = createContext<any>(null);

export const useUserContext = () => {
	return useContext(UserContext);
};

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
	const [accessToken, updateAccessToken] = useState('');
	const [refreshToken, updateRefreshToken] = useState('');
	const [userData, updateUserData] = useState({
		username: '',
		user_id: undefined,
		name: '',
		email: '',
		birthday: '',
		profile_exists: false,
		profile_image: 'default.png'
	});
	const [profile, setProfile] = useState<IProfile>({
		user_id: undefined,
		name: '',
		birthday: '',
		profile_image: '',
		gender: '',
		looking: '',
		min_age: undefined,
		max_age: undefined,
		interests: {},
		introduction: '',
		country: '',
		city: '',
		geolocation: {},
		ip_location: {},
		latitude: '', 
		longitude: ''
	});
	const [useGPS, setUseGPS] = useState(false);
	const [useIPLocation, setUseIPLocation] = useState(false);
	const [useUserCoordinates, setUseUserCoordinates] = useState(false);


	useEffect(() => {
		// Look for user information in session storage
		const storedInfo = sessionStorage.getItem('userData');
		if (storedInfo) {
			const userInfo = JSON.parse(storedInfo);
			updateUserData(userInfo);
		}
		const storedProfile = sessionStorage.getItem('profile');
		if (storedProfile) {
			const userInfo = JSON.parse(storedProfile);
			setProfile(userInfo);
		}
		const accessTokenStored = sessionStorage.getItem('accessToken');
		const refreshTokenStored = sessionStorage.getItem('refreshToken');
		if (accessTokenStored && refreshTokenStored) {
			updateAccessToken(accessTokenStored);
			updateRefreshToken(refreshTokenStored);
		}
	}, []);

	return (
		<UserContext.Provider
			value={{
				userData,
				profile,
				updateUserData,
				setProfile,
				accessToken,
				refreshToken,
				updateAccessToken,
				updateRefreshToken,
				useGPS,
				useIPLocation,
				useUserCoordinates
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
