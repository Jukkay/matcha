import { NextPage } from 'next';

const Privacy: NextPage = () => {
	return (
		<div className="columns is-centered is-gapless">
			<div className="column is-three-quarters mt-6 pt-6">
				<section className="section">
					<h3 className="title is-1">Privacy policy</h3>
					<p className="content">
						Your information will not be shared with anyone outside
						the scope of this service. We will not sell your
						information nor use it for nefarious purposes.
					</p>
				</section>
				<section className="section">
					<h3 className="title is-3">Stored information</h3>
					<p className="content">
						We store your basic user information such as username,
						password, email address, profile picture,uploaded
						pictures, birthday, login status and last login time.
						This information is necessary to provide this service
						with all its functionality to you.
					</p>
					<p className="content">
						In addition to your user information, we also store your
						dating profile information if you have made an active
						profile. Profile data includes information related to
						your profile such as your gender and mate preferences,
						your profile introduction, your location, and interests.
						This information is needed to make profiles and matching
						work the way they do.
					</p>
					<p className="content">
						We also log your activities such as likes, messages,
						profile views, reports and blocking of other users. This
						information is used to provide you functionalities such
						as viewed profiles, blocking, reporting and private
						messaging.
					</p>
				</section>
				<section className="section">
					<h3 className="title is-3">Location information</h3>
					<p className="content">
						Your location is mandatory to make this service work
						properly. Because of this your browser asks your
						permission to give us your location. If your decline to
						give us your location, we&apos;ll make a rough
						estimation of your location based on your IP address.
						This information is used to match you to people near
						you.
					</p>
				</section>
				<section className="section">
					<h3 className="title is-3">
						Removal of personal information
					</h3>
					<p className="content">
						You&apos;re able to remove your profile and information
						related to it whenever you like through your profile
						edit page. This will, however, make the service unsable,
						because profile is needed to make the service work.
					</p>
					<p className="content">
						Removing profile does NOT remove user information. User
						account and information related to it needs to be
						removed separately from your account settings.
					</p>
				</section>
				<section className="section">
					<h3 className="title is-3">Information requests</h3>
					<p className="content">
						As required by GDPR, you may make a request to see
						information we have stored about you. To do this, email
						our administrator team at jukkacamagru@outlook.com.
					</p>
				</section>
			</div>
		</div>
	);
};

export default Privacy;
