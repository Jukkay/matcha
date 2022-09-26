import { API } from '../../utilities/api';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useUserContext } from '../../components/UserContext';

const Logout: NextPage = () => {
	const {
		updateAccessToken,
		updateRefreshToken,
		userData,
		updateUserData,
		refreshToken,
		setProfile
	} = useUserContext();

	useEffect(() => {
		try {
			API.post('/logout/', {
				user_id: userData.user_id,
				refreshToken: refreshToken,
			});
			updateAccessToken('');
			updateRefreshToken('');
			updateUserData({});
			setProfile({})
			sessionStorage?.removeItem('accessToken');
			sessionStorage?.removeItem('refreshToken');
			sessionStorage?.removeItem('userData');
			sessionStorage?.removeItem('profile');
		} catch (err) {}
	}, []);

	return (
		<div className="columns">
			<div className="column is-half is-offset-one-quarter">
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
