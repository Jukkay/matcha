import { useState, useContext, createContext } from "react";
export type UserInfo = {
  username: string | undefined;
  user_id: number | null;
  name: string | undefined;
  email: string | undefined;
  loggedIn: boolean;
  token: string | undefined;
  updateToken: (token: string) => void;
};

export interface IUser {
  user: UserInfo;
  updateUser: (user: UserInfo) => void;
}
const [token, setToken] = useState("");
export const [user, setUser] = useState<UserInfo>({
	username: "",
	user_id: null,
	name: "",
	email: "",
	loggedIn: false,
	token: token,
	updateToken: setToken
});

// Context for user information
export const UserContext = createContext<IUser>({
	user: user,
    updateUser: setUser,
});

export const useUserContext = () => useContext(UserContext);

