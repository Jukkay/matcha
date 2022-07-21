import {
  createContext,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Footer from "./footer";
import { IUser, UserInfo } from "./UserContext";
import NavbarComponent from "./navbar";

export const UserContext = createContext<any>(null);
const Layout = ({ children }: { children: ReactNode }) => {
  const [token, updateToken] = useState("");
  const [userData, updateUserData] = useState<UserInfo>({
    username: "",
    user_id: null,
    name: "",
    email: "",
    token: token,
    updateToken: updateToken,
  });

  useEffect(() => {
    // Look for user information in local storage
    const storedInfo = localStorage.getItem("userData");
    console.log('UserData found on initialization', storedInfo);
    if (storedInfo) {
      const userInfo = JSON.parse(storedInfo);
      updateUserData(userInfo);
    }
  }, []);
  console.log('userData state on layout render', userData)
  return (
    <UserContext.Provider value={{ userData, updateUserData }}>
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
