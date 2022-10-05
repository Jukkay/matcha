export interface IEmailToken {
	email: string;
	iat: number;
	exp: number;
	iss: string;
}

export interface ITokenList {
	[key: string]: number;
}
export interface IAccesstoken {
	user_id: string;
	iat: number;
	exp: number;
	iss: string;
}

export interface IOnlineUser {
		user_id: number,
		socket_id: string,
		active: number,
}