import react, {
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
  const [accessToken, updateAccessToken] = useState('');
  const [refreshToken, updateRefreshToken] = useState('');
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
    const accessTokenStored = sessionStorage.getItem("accessToken");
    const refreshTokenStored = sessionStorage.getItem("refreshToken");
    if (accessTokenStored && refreshTokenStored) {
      updateAccessToken(accessTokenStored);
      updateRefreshToken(refreshTokenStored);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ userData, updateUserData, accessToken, refreshToken, updateAccessToken, updateRefreshToken }}
    >
      {children}
    </UserContext.Provider>
  );
};
