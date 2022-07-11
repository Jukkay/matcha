interface IEmailToken {
	email: string,
	iat: number,
	exp: number,
	iss: string
}

interface IUserToken {
	username: string,
	iat: number,
	exp: number,
	iss: string
}

export default IEmailToken