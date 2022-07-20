import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import Footer from "./footer";
import {UserInfo} from "./UserContext";
import NavbarComponent from "./navbar";

export const UserContext = createContext({});
const Layout = ({ children }: { children: ReactNode }) => {

  // Look for user information in local storage

    const [token, updateToken] = useState("");
    const [user, updateUser] = useState<UserInfo>({
      username: "",
      user_id: null,
      name: "",
      email: "",
      loggedIn: false,
      token: token,
      updateToken: updateToken
    })
    const storedInfo = window.localStorage.getItem("userInfo");
    if (storedInfo) {
      const userInfo = JSON.parse(storedInfo);
      updateUser(userInfo);
      user.updateToken(userInfo.token);
    }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      <div className="container is-widescreen">
        <NavbarComponent />
        <div>
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </UserContext.Provider>
  );
};
export default Layout;
