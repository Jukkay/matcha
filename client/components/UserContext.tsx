
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
  user?: UserInfo;
  updateUser?: (user: UserInfo) => void;
}
