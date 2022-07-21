import { createContext } from "react";

export type UserInfo = {
  username: string | undefined;
  user_id: number | null;
  name: string | undefined;
  email: string | undefined;
  token: string | undefined;
  updateToken: (token: string) => void;
};

export interface IUser {
  user?: UserInfo;
  updateUser?: (user: UserInfo) => void;
}

// export const UserContextProvider = () => {

//   return (
//     <UserContextProvider

//   )
// }
export const UserContext = createContext<any>(null);
