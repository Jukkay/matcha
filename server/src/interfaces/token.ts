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
