import React from "react"
import Footer from "./footer"
import Navbar from "./navbar"
import styles from '../styles/Home.module.css'

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="container md:container md:mx-auto">
			<Navbar />
			<div>
				<main className={styles.main}>
					{children}
				</main>
			</div>
			<Footer />
		</div>
	)
}
export default Layout