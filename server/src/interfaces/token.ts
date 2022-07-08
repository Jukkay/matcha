interface IEmailToken {
	email: string,
	iat: number,
	exp: number,
	iss: string
}

export default IEmailToken