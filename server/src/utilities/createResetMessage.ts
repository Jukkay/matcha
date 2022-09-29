import { CLIENT_URL } from './getURL'

const createResetMessage = (email_token: string) => {

	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
	</head>
	<body>
	<section class="section">
	<h1 class="title is-1">Reset your 42 Dates password</h1>
	<p class="block">We've received a request to reset your password. Please click the link below to reset your password. If it wasn't you, please just ignore this message.</p>
	<p class="block"><a href="${CLIENT_URL}/setpassword/${email_token}">Click here to reset password.</a></p>
	<p class="block has-text-weight-bold">Best regards,</p>
	<p class="block has-text-weight-bold">42 Dates Team</p>
	</section>
	</body>
	</html>`
}

export default createResetMessage