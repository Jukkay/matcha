import {
  ReactNode
} from "react";
import Footer from "./footer";
import { UserContextProvider } from "./UserContext";
import NavbarComponent from "./navbar";
import { SocketContextProvider } from "./SocketContext";
const Layout = ({ children }: { children: ReactNode }) => {

  return (
    <UserContextProvider>
      <SocketContextProvider>
      <div className="">
        <NavbarComponent />
          <main>{children}</main>
        <Footer />
      </div>
      </SocketContextProvider>
    </UserContextProvider>
  );
};
export default Layout;
