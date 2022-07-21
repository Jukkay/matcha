import type { NextPage } from "next";
import { useState, useEffect, useContext } from "react";
import { useUserContext} from "../../components/UserContext";

const Logout: NextPage = (props) => {
	const {updateUserData} = useUserContext()
	useEffect(() => {
		updateUserData({})
		sessionStorage.removeItem('userData');
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