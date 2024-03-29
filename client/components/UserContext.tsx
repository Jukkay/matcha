import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { IProfile } from '../types/types';

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
		location_permitted: false,
	});

	const [profile, setProfile] = useState<IProfile>({
		user_id: 0,
		name: '',
		birthday: '',
		profile_image: 'profile.svg',
		gender: '',
		looking: '',
		min_age: 0,
		max_age: 0,
		interests: [],
		introduction: '',
		country: '',
		city: '',
		latitude: '',
		longitude: '',
		user_latitude: '',
		user_longitude: '',
		famerating: 0,
	});

	// Read from sessionStorage
	useEffect(() => {
		updateUserData((current) => {
			// Look for user information in session storage
			const storedInfo = sessionStorage.getItem('userData');
			if (storedInfo) {
				return JSON.parse(storedInfo);
			}
			return current;
		});
		setProfile((current) => {
			// Look for user information in session storage
			const storedProfile = sessionStorage.getItem('profile');
			if (storedProfile) {
				return JSON.parse(storedProfile);
			}
			return current;
		});
		updateAccessToken((current) => {
			const accessTokenStored = sessionStorage.getItem('accessToken');
			if (accessTokenStored) {
				return accessTokenStored;
			}
			return current;
		});
		updateRefreshToken((current) => {
			const refreshTokenStored = sessionStorage.getItem('refreshToken');
			if (refreshTokenStored) {
				return refreshTokenStored;
			}
			return current;
		});
	}, []);

	// Persist to sessionStorage
	useEffect(() => {
		if (!accessToken) return
		sessionStorage.setItem(
			'accessToken',
			accessToken
		);
	}, [accessToken]);

	useEffect(() => {
		if (!refreshToken) return
		sessionStorage.setItem(
			'refreshToken',
			refreshToken
		);
	}, [refreshToken]);

	useEffect(() => {
		if (!userData.user_id) return
		sessionStorage.setItem(
			'userData',
			JSON.stringify(userData)
		);
	}, [userData]);

	useEffect(() => {
		if (!profile.user_id) return
		sessionStorage.setItem('profile', JSON.stringify(profile));
	}, [profile]);

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
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
