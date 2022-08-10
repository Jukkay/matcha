import {
  ReactNode
} from "react";
import Footer from "./footer";
import { UserContextProvider } from "./UserContext";
import NavbarComponent from "./navbar";

const Layout = ({ children }: { children: ReactNode }) => {

  return (
    <UserContextProvider>
      <div className="columns is-flex-direction-column is-fullheight-100vh">
        <NavbarComponent />
        <div className="column">
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </UserContextProvider>
  );
};
export default Layout;
