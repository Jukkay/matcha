import {
  ReactNode
} from "react";
import Footer from "./footer";
import { UserContextProvider } from "./UserContext";
import NavbarComponent from "./navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <UserContextProvider>
      <div className="container is-widescreen">
        <NavbarComponent />
        <div>
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </UserContextProvider>
  );
};
export default Layout;
