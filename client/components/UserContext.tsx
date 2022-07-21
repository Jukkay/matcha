import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserInfo = {
  username: string | undefined;
  user_id: number | null;
  name: string | undefined;
  email: string | undefined;
};

export interface IUser {
  user?: UserInfo;
  updateUser?: (user: UserInfo) => void;
}
export const UserContext = createContext<any>(null);

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, updateTokens] = useState({});
  const [userData, updateUserData] = useState<UserInfo>({
    username: "",
    user_id: null,
    name: "",
    email: "",
  });

  useEffect(() => {
    // Look for user information in local storage
    const storedInfo = sessionStorage.getItem("userData");
    if (storedInfo) {
      const userInfo = JSON.parse(storedInfo);
      updateUserData(userInfo);
    }
    const storedTokens = sessionStorage.getItem("tokens");
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      updateTokens(tokens);
    }
  }, []);
  return (
    <UserContext.Provider
      value={{ userData, updateUserData, tokens, updateTokens }}
    >
      {children}
    </UserContext.Provider>
  );
};
