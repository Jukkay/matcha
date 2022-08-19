import {API} from "../../utilities/api";
import type { NextPage } from "next";
import { useState, useEffect, useContext } from "react";
import { useUserContext} from "../../components/UserContext";

const Logout: NextPage = (props) => {
	const {updateAccessToken, updateRefreshToken, updateUserData, refreshToken} = useUserContext()
	useEffect(() => {
		API.post('/logout/', {refreshToken: refreshToken }).then(res => {
			if (res.status === 200) {
				updateAccessToken('')
				updateRefreshToken('')
				updateUserData({})
				sessionStorage?.removeItem('accessToken');
				sessionStorage?.removeItem('refreshToken');
				sessionStorage?.removeItem('userData');
				sessionStorage?.removeItem('profile')
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