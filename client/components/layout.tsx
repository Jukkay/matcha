import React from "react"
import Footer from "./footer"
import Navbar from "./navbar"


const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="container md:container md:mxAuto">
			<Navbar />
			<div>
				<main>
					{children}
				</main>
			</div>
			<Footer />
		</div>
	)
}
export default Layout