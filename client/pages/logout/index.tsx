import axios from "axios";
import type { NextPage } from "next";
import { useState, useEffect, useContext } from "react";
import { useUserContext} from "../../components/UserContext";
import { API_URL } from '../../utilities/interceptor';

const Logout: NextPage = (props) => {
	const {updateAccessToken, updateRefreshToken, updateUserData, refreshToken, user_id} = useUserContext()
	useEffect(() => {
		axios.post(`${API_URL}/logout/`, {refreshToken: refreshToken, user_id: user_id}).then(res => {
			if (res.status === 200) {
				updateAccessToken('')
				updateRefreshToken('')
				updateUserData({})
				sessionStorage.removeItem('accessToken');
				sessionStorage.removeItem('refreshToken');
				sessionStorage.removeItem('userData');
			}
		})
	}, [])

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
	)
}
export default Logout