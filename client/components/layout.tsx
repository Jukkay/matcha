import {
  ReactNode
} from "react";
import Footer from "./footer";
import { UserContextProvider } from "./UserContext";
import NavbarComponent from "./navbar";
import { SocketContextProvider } from "./SocketContext";
import { NotificationContextProvider } from "./NotificationContext";
const Layout = ({ children }: { children: ReactNode }) => {

  return (
    <UserContextProvider>
      {/* <SocketContextProvider> */}
      <NotificationContextProvider>
        <div className="columns is-flex-direction-column is-fullheight-100vh">
        <NavbarComponent />
          <main className="column">{children}</main>
        <Footer />
        </div>
      </NotificationContextProvider>
      {/* </SocketContextProvider> */}
    </UserContextProvider>
  );
};
export default Layout;
