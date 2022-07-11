
export const getURL = () => {

	const protocol = process.env.PROTOCOL + '\:\/\/';
	const domain = process.env.DOMAIN_NAME || 'localhost'
	const port = process.env.PORT == '80' || process.env.PORT == '443' ? '' : ':' + process.env.PORT
	return `${protocol}${domain}${port}`
}