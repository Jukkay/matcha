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
      <SocketContextProvider>
      <NotificationContextProvider>
        <NavbarComponent />
          <main>{children}</main>
        <Footer />
      </NotificationContextProvider>
      </SocketContextProvider>
    </UserContextProvider>
  );
};
export default Layout;
