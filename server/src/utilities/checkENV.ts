export const getServerToken = () => {
	if (!process.env.SERVER_TOKEN)
		throw new Error('Cannot read env for server token');
	return process.env.SERVER_TOKEN;
};

export const getRefreshToken = () => {
	if (!process.env.REFRESH_TOKEN)
		throw new Error('Cannot read env for refresh token');
	return process.env.REFRESH_TOKEN;
};

export const getEmailPassword = () => {
	if (!process.env.OUTLOOK_PASSWORD)
		throw new Error('Cannot read env for email password');
	return process.env.OUTLOOK_PASSWORD;
};

export const getEmailUser = () => {
	if (!process.env.MAIL_USER)
		throw new Error('Cannot read env for email user');
	return process.env.MAIL_USER;
};

export const getMySQLPassword = () => {
	if (!process.env.MYSQL_PASSWORD)
		throw new Error('Cannot read env for MySQL password');
	return process.env.MYSQL_PASSWORD;
};

export const getMySQLHost = () => {
	if (!process.env.MYSQL_HOST)
		throw new Error('Cannot read env for MySQL host');
	return process.env.MYSQL_HOST;
};

export const getMySQLUser = () => {
	if (!process.env.MYSQL_DATABASE)
		throw new Error('Cannot read env for MySQL database');
	return process.env.MYSQL_DATABASE;
};

export const getMySQLDatabase = () => {
	if (!process.env.MYSQL_USER)
		throw new Error('Cannot read env for MySQL user');
	return process.env.MYSQL_USER;
};

export const getMySQLConnectionLimit = () => {
	if (!process.env.MYSQL_CONNECTION_LIMIT)
		throw new Error('Cannot read env for MySQL connection limit');
	return Number(process.env.MYSQL_CONNECTION_LIMIT);
};

export const getAdminEmail = () => {
	if (!process.env.ADMIN_EMAIL)
		throw new Error('Cannot read env for admin email');
	return process.env.ADMIN_EMAIL;
};

export const getClientURL = () => {
	if (!process.env.CLIENT_URL)
		throw new Error('Cannot read env for client URL');
	return process.env.CLIENT_URL;
};

export const getImagePath = () => {
	if (!process.env.IMG_PATH) throw new Error('Cannot read env for IMG_PATH');
	return process.env.IMG_PATH;
};

export const getPort = () => {
	if (!process.env.PORT) throw new Error('Cannot read env for port');
	return process.env.PORT;
};

export const checkENV = () => {
	getPort();
	getServerToken();
	getRefreshToken();
	getEmailPassword();
	getEmailUser();
	getMySQLPassword();
	getMySQLHost();
	getMySQLUser();
	getMySQLDatabase();
	getMySQLConnectionLimit();
	getAdminEmail();
	getClientURL();
	getImagePath();
};
