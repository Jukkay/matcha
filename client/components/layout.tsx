import React, {
  ReactNode,
  useEffect,
} from "react";
import Footer from "./footer";
import {useUserContext, UserContext} from "./UserContext";
import NavbarComponent from "./navbar";

const Layout = ({ children }: { children: ReactNode }) => {

  const {user, updateUser} = useUserContext()
  // Look for user information in local storage
  useEffect(() => {
    const storedInfo = window.localStorage.getItem("userInfo");
    if (storedInfo) {
      const userInfo = JSON.parse(storedInfo);
      updateUser(userInfo);
      user.updateToken(userInfo.token);
    }
  }, []);
  return (
    <UserContext.Provider value={{ user, updateUser }}>
      <div className="container is-widescreen">
        <NavbarComponent loggedIn={user.loggedIn} />
        <div>
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </UserContext.Provider>
  );
};
export default Layout;
