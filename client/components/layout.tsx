import React from "react";
import Footer from "./footer";
import NavbarComponent from "./navbar";
import { Container } from "react-bulma-components";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Container breakpoint='widescreen' max={true}>
        <NavbarComponent />
        <div>
          <main>{children}</main>
        </div>
        <Footer />
      </Container>
    </div>
  );
};
export default Layout;
