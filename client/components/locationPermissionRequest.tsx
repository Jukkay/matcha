import { useEffect, useState } from 'react';
import { authAPI } from '../utilities/api';
import { useUserContext } from './UserContext';
import { MdLocationOn, MdLocationOff } from 'react-icons/md';

export const LocationPermissionRequest = () => {
	const { userData, updateUserData, profile, setProfile } = useUserContext();

	const handleAllow = (event: React.MouseEvent) => {
		event.preventDefault();
		askForPermission();
		updateUserData({ ...userData, location_permitted: true });
		updatePermission(true)
	};

	const handleDeny = (event: React.MouseEvent) => {
		event.preventDefault();
		updateUserData({ ...userData, location_permitted: false });
		updatePermission(false)
	};
	// Ask for location permission and locate user
	const askForPermission = () => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition((position) => {
				if (position) {
					setProfile({
						...profile,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				}
			});
		}
	};
	
	// Update permission to database
	const updatePermission = async (permission: boolean) => {
		try {
			if (!userData.user_id) return;
			await authAPI.post(`/gpspermission/`, {
				user_id: userData.user_id,
				location_permitted: permission
			});
		} catch {}
	};

	// Update location information to db
	useEffect(() => {
		const controller = new AbortController();
		const fetch = async () => {
			try {
				await authAPI.post('/geolocation', {
					latitude: profile.latitude,
					longitude: profile.longitude,
					signal: controller.signal,
				});
			} catch {}
		};
		fetch();
		return () => controller.abort();
	}, [profile.latitude, profile.longitude]);

	return userData.location_permitted ? (
		<button className="button mt-3 ml-4 is-primary" onClick={handleDeny}>
			<span className="mr-3">GPS location ON</span>
			<MdLocationOn />
		</button>
	) : (
		<div>
		<button className="button mt-3 ml-4 is-primary" onClick={handleAllow}>
			<span className="mr-3">GPS location OFF</span>
			<MdLocationOff />
		</button>
		<p className="mt-3 ml-4 help">We can give you more accurate distance information and better suggestions, if you give us access to your location information.</p>
		</div>
	);
};
