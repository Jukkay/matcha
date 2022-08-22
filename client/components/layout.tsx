import {
  ReactNode
} from "react";
import Footer from "./footer";
import { UserContextProvider } from "./UserContext";
import NavbarComponent from "./navbar";

const Layout = ({ children }: { children: ReactNode }) => {

  return (
    <UserContextProvider>
      <div className="">
        <NavbarComponent />
        <div className="">
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </UserContextProvider>
  );
};
export default Layout;
