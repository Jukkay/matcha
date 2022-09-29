import { CLIENT_URL } from './getURL'

const createMessage = (email_token: string) => {

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
	<h1 class="title is-1">Welcome to 42 dates!</h1>
	<p class="block">For the last step of registration we ask you to click the link below to validate this email address.</p>
	<p class="block"><a href="${CLIENT_URL}/verifyemail/${email_token}">Click here to validate your account.</a></p>
	<p class="block has-text-weight-bold">Best regards,</p>
	<p class="block has-text-weight-bold">42 Dates Team</p>
	</section>
	</body>
	</html>`
}

export default createMessage