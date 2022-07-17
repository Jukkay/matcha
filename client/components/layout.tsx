import React from "react";
import Footer from "./footer";
import NavbarComponent from "./navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container is-widescreen">
      <NavbarComponent />
      <div>
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};
export default Layout;
