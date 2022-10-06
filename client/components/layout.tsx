import { ReactNode } from 'react';
import Footer from './footer';
import { UserContextProvider } from './UserContext';
import NavbarComponent from './navbar';
import { NotificationContextProvider } from './NotificationContext';
import Head from 'next/head';
const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<Head>
				<title>42 Dates</title>
			</Head>
			<UserContextProvider>
				<NotificationContextProvider>
					<div className="columns is-flex-direction-column is-fullheight-100vh is-align-content-center is-gapless">
						<NavbarComponent />
						<main className="column">{children}</main>
						<Footer />
					</div>
				</NotificationContextProvider>
			</UserContextProvider>
		</>
	);
};
export default Layout;
