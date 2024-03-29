import { API } from '../../utilities/api';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';
import { socket } from '../../components/socket';

const Logout: NextPage = () => {
	const {
		updateAccessToken,
		updateRefreshToken,
		updateUserData,
		refreshToken,
		setProfile,
	} = useUserContext();

	useEffect(() => {
		if (!refreshToken) return;
		try {
			if (socket.connected)
				socket.disconnect();
			API.post('/logout/', {
				refreshToken: refreshToken,
			});
			updateAccessToken('');
			updateRefreshToken('');
			updateUserData({});
			setProfile({});
			sessionStorage?.removeItem('accessToken');
			sessionStorage?.removeItem('refreshToken');
			sessionStorage?.removeItem('userData');
			sessionStorage?.removeItem('profile');
		} catch (err) {}
	}, [refreshToken]);

	return (
		<div className="columns is-centered is-gapless">
			<div className="column is-half mt-6">
				<section className="section">
					<div className="box has-text-centered">
						<section className="section">
							<h3 className="title is-3">Logout successful</h3>
						</section>
					</div>
				</section>
			</div>
		</div>
	);
};
export default Logout;
