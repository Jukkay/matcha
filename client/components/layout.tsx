import {
  ReactNode
} from "react";
import Footer from "./footer";
import { UserContextProvider } from "./UserContext";
import NavbarComponent from "./navbar";
import { NotificationContextProvider } from "./NotificationContext";
const Layout = ({ children }: { children: ReactNode }) => {

  return (
    <UserContextProvider>
      <NotificationContextProvider>
        <div className="columns is-flex-direction-column">
        <NavbarComponent />
          <main className="column">{children}</main>
        <Footer />
        </div>
      </NotificationContextProvider>
    </UserContextProvider>
  );
};
export default Layout;
